import * as vscode from "vscode"
import { watch, readFile, rm, writeFileSync } from "fs"
import { join } from "path"
import { Uri } from "vscode"

export function activate(context: vscode.ExtensionContext) {
  // Register a new command
  let disposable = vscode.commands.registerCommand(
    "florencio.terminal",
    async () => {
      const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath

      if(!cwd) {
        vscode.window.showErrorMessage("No workspace folder found")
        return
      }


      console.log("here ~ path:", cwd)

      const terminal = vscode.window.createTerminal({
        name: "Florencio Terminal",
        location: vscode.TerminalLocation.Editor,
      })

      vscode.window.onDidOpenTerminal((e) => {
        console.log("here ~ e:", e)
        // terminal.show()
      })

      const outputFile = join("/tmp", "tmp-output")
      const doneFile = join("/tmp", "tmp-done")
      console.log("here ~ doneFile:", doneFile)
      const cmd = "rg --files | fzf -m --preview 'bat --color=always {}' --preview-window '~3'"
      
      terminal.show()
      terminal.sendText(`${cmd} > ${outputFile}; echo "done" > ${doneFile}`, true)

      console.log("here ~ active text editor:", vscode.window.activeTextEditor)
      console.log("here ~ active terminal:", vscode.window.activeTerminal)
      
      writeFileSync(doneFile, "")
      const result = await waitForFileUpdate(outputFile, doneFile)

      console.log("here ~ result:", result)

      if(result?.length > 0) {
        const file = join(cwd, result.trim()) 
        console.log("here ~ file:", file)

        const doc = await vscode.workspace.openTextDocument(Uri.file(file))
        await vscode.window.showTextDocument(doc)
      }

      terminal.dispose()
    }
  )

  context.subscriptions.push(disposable)

  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(async () => {
      await autoCloseSidebar()
    })
  )
}

async function waitForFileUpdate(
  outputFile: string,
  triggerFile: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const watcher = watch(triggerFile)
    watcher.on("change", () => {
      console.log("here on change")
      watcher.close()
      readFile(outputFile, "utf8", (err, data) => {
        rm(outputFile, () => {})
        rm(triggerFile, () => {})
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
    watcher.on("error", reject)
  })
}

// close the sidebar if there are two editors open side by side
async function autoCloseSidebar() {
  const tabGroups = vscode.window.tabGroups.all

  if (tabGroups.length > 1) {
    // closing the split editor and opening the sidebar
    if (tabGroups[1]?.tabs.length === 0) {
      console.log("autoCloseSidebar - opening sidebar")
      await vscode.commands.executeCommand(
        "workbench.action.toggleSidebarVisibility"
      )
      return
    }

    // opening a split editor and closing the sidebar
    if (tabGroups[1]?.tabs.length > 0) {
      console.log("autoCloseSidebar - closing sidebar")
      await vscode.commands.executeCommand("workbench.action.closeSidebar")
      return
    }
  }
}
