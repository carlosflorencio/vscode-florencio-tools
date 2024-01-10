import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("activated")
  // listen for changes in the visible text editors
  vscode.window.onDidChangeVisibleTextEditors(async (editors) => {
    await manageWindows(editors)
  })
}

// This method is called when your extension is deactivated
// export function deactivate() {}

let previousEditorsCount = 0

// close the sidebar if there are two editors open side by side
async function manageWindows(editors: Readonly<vscode.TextEditor[]>) {
  const visibleEditors = vscode.window.visibleTextEditors
  const sidebarVisible = isSidebarVisible()

  vscode.window.showInformationMessage(
    `Visible editors: ${visibleEditors.length}, received editors: ${editors.length} sidebar visible: ${sidebarVisible}`
  )

  console.log(
    "context",
    await vscode.commands.executeCommand("getContextKeyInfo")
  )
  // If there are two editors open side by side
  if (visibleEditors.length === 2) {
    if (isSidebarVisible()) {
      // Close the sidebar
      await vscode.commands.executeCommand(
        "workbench.action.toggleSidebarVisibility"
      )
    }
  }
}

function isSidebarVisible() {
  console.log("here workbench", vscode.workspace.getConfiguration("workbench"))
  return vscode.workspace
    .getConfiguration("workbench")
    .get("sidebar.visible") as boolean
}
