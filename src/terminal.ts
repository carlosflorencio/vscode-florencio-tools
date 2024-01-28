import {
  Disposable, Terminal,
  TerminalLocation,
  TerminalOptions,
  window
} from "vscode"
import { join } from "path"
import { promises as fs } from "fs"

// hack to allow multiple terminals simultaneously
let terminalCounter = 0

const UTILITY_FILES_FOLDER = "/tmp"

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

    this.terminalId = terminalCounter++

    // hack to grab the command output while vscode
    // doesn't provide an api for it
    this.outputFile = join(
      UTILITY_FILES_FOLDER,
      `tmp-output-${this.terminalId}`
    )
    this.doneFile = join(UTILITY_FILES_FOLDER, `tmp-done-${this.terminalId}`)
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
        // close the terminal
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
      console.error("error deleting files:", error)
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
