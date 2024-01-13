import * as vscode from "vscode"

let previousEditorsCount = 0

export function activate(context: vscode.ExtensionContext) {
  previousEditorsCount = vscode.window.visibleTextEditors.length

  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors((editors) => {
      autoCloseSidebar(editors)
    })
  )
}


// close the sidebar if there are two editors open side by side
function autoCloseSidebar(editors: Readonly<vscode.TextEditor[]>) {
  // opening side by side
  if (editors.length === 2 && previousEditorsCount === 1) {
    vscode.commands.executeCommand("workbench.action.closeSidebar")
  }

  // back to a single editor
  if (editors.length === 1 && previousEditorsCount === 2) {
    vscode.commands.executeCommand("workbench.action.toggleSidebarVisibility")
  }

  previousEditorsCount = editors.length
}
