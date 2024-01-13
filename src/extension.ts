import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
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
