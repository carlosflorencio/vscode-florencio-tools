import * as vscode from "vscode"
import { lazyGit, openFile, searchInFiles } from "./terminal-commands"

export function activate(context: vscode.ExtensionContext) {
  // commands
  context.subscriptions.push(
    vscode.commands.registerCommand("florencio.openFiles", async () => {
      await openFile(context.extensionPath)
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("florencio.searchInFiles", async () => {
      await searchInFiles(context.extensionPath)
    })
  )

  
  context.subscriptions.push(
    vscode.commands.registerCommand("florencio.lazygit", async () => {
      await lazyGit()
    })
  )

  // events
  // TODO: change this event to when an editor tab group is open or closed
  // TODO: add config to enable/disable this feature
  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors(async () => {
      await autoCloseSidebar()
    })
  )
}

// close the sidebar if there are two editors open side by side
async function autoCloseSidebar() {
  const tabGroups = vscode.window.tabGroups.all

  if (tabGroups.length > 1) {
    // closing the split editor and opening the sidebar
    if (tabGroups[1]?.tabs.length === 0) {
      await vscode.commands.executeCommand(
        "workbench.action.toggleSidebarVisibility"
      )
      return
    }

    // opening a split editor and closing the sidebar
    if (tabGroups[1]?.tabs.length > 0) {
      await vscode.commands.executeCommand("workbench.action.closeSidebar")
      return
    }
  }
}
