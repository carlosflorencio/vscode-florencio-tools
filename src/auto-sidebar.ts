import { ExtensionContext, commands, window } from "vscode"
import config from "./config"

/**
 * Auto close / open the sidebar when opening vertical split editors
 * Useful to maximize the editor area
 */
export async function autoManageSidebar() {
  const tabGroups = window.tabGroups.all

  if (tabGroups.length > 1) {
    // closing the split editor and opening the sidebar
    if (tabGroups[1]?.tabs.length === 0) {
      await commands.executeCommand("workbench.action.toggleSidebarVisibility")
      return
    }

    // opening a split editor and closing the sidebar
    if (tabGroups[1]?.tabs.length > 0) {
      await commands.executeCommand("workbench.action.closeSidebar")
      return
    }
  }
}

export function registerAutoSidebar(context: ExtensionContext) {
  context.subscriptions.push(
    window.onDidChangeVisibleTextEditors(async () => {
      if (!config.autoSidebarEnabled()) {
        return
      }

      await autoManageSidebar()
    })
  )
}
