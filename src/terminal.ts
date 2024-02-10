import {
  Disposable,
  Terminal,
  TerminalLocation,
  TerminalOptions,
  window,
} from "vscode"
import { join } from "path"
import { promises as fs } from "fs"

// Hack to allow having multiple terminals simultaneously
let terminalCounter = 0

const TMP_FILES_FOLDER = "/tmp"

/**
 * A terminal wrapper that runs a single command and returns the output
 * After the command runs, the terminal is closed
 *
 * Since vscode doesn't provide an api to get the output of a terminal
 * this class uses a hack to get the output of a terminal by writing the output
 * to a file and then reading it
 *
 * Correctly handles the terminal close action by the user
 * (focus the previous editor and clean up the tmp files)
 */
export class SingleCommandTerminal {
  private terminal: Terminal
  private terminalId: number
  private outputFile: string
  private doneFile: string
  private disposables: Disposable[] = []
  private abortWatcher?: AbortController

  constructor(options?: TerminalOptions) {
    this.terminal = window.createTerminal({
      ...options,
      shellPath: options?.shellPath ?? "/bin/sh", // faster
      location: options?.location ?? TerminalLocation.Editor,
    })

    this.disposables.push(
      window.onDidCloseTerminal((e) => {
        if (e.name === this.terminal.name) {
          this.dispose()
        }
      })
    )

    // fix the first time opening the terminal it doens't get focus
    this.disposables.push(
      window.onDidChangeTerminalState((e) => {
        if (e.name === this.terminal.name && e.state.isInteractedWith) {
          window.activeTerminal?.show()
        }
      })
    )

    this.terminalId = terminalCounter++

    // hack to grab the command output while vscode
    // doesn't provide an api for it
    this.outputFile = join(TMP_FILES_FOLDER, `tmp-output-${this.terminalId}`)
    this.doneFile = join(TMP_FILES_FOLDER, `tmp-done-${this.terminalId}`)
  }

  public async run(cmd: string): Promise<string[]> {
    await fs.writeFile(this.doneFile, "")

    this.terminal.sendText(
      `${cmd} > ${this.outputFile}; echo "done" > ${this.doneFile}`,
      true
    )

    this.terminal.show()
    this.abortWatcher = new AbortController()

    return waitForFileUpdate(
      this.outputFile,
      this.doneFile,
      this.abortWatcher.signal
    )
      .then((result) => {
        return result
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
      })
      .finally(() => {
        // close the terminal after running the command
        this.terminal.dispose()
      })
  }

  /**
   * Run a command but don't return any output
   * Waits for completion
   */
  public async runWithoutOutput(cmd: string) {
    await fs.writeFile(this.doneFile, "")
    this.terminal.sendText(`${cmd}; echo "done" > ${this.doneFile}`, true)

    this.terminal.show()

    return waitForDoneFile(this.doneFile).finally(() => {
      // close the terminal after running the command
      this.terminal.dispose()
    })
  }

  public dispose() {
    this.terminal.dispose()
    this.disposables.forEach((d) => d.dispose())
    this.abortWatcher?.abort()

    try {
      fs.rm(this.outputFile)
      fs.rm(this.doneFile)
    } catch (error) {
      console.error("SingleCommandTerminal: error deleting files:", error)
    }
  }
}

async function waitForFileUpdate(
  outputFile: string,
  doneFile: string,
  signal?: AbortSignal
): Promise<string> {
  const watcher = fs.watch(doneFile, { signal })

  for await (const _ of watcher) {
    return fs.readFile(outputFile, "utf8")
  }

  return ""
}

async function waitForDoneFile(doneFile: string): Promise<void> {
  const watcher = fs.watch(doneFile)

  for await (const _ of watcher) {
    return
  }

  return
}
