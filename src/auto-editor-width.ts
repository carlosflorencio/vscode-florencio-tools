import { ExtensionContext, commands, window } from "vscode"
import config from "./config"

/**
 * Increments the active editor width when switching between editors groups
 */
export function registerAutoEditorWidth(context: ExtensionContext) {
  if (!config.editorAutoWidthEnabled()) {
    return
  }

  let lastActiveGroup = window.tabGroups.activeTabGroup
  let didChangeSize = false

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor) {
        lastActiveGroup = window.tabGroups.activeTabGroup
        return
      }

      // wait for the editor to be fully active
      setTimeout(async () => {
        const splitCount = window.tabGroups.all.length

        if (splitCount < 3) {
          // restore balance after all the resizes done
          if (didChangeSize) {
            await commands.executeCommand("workbench.action.evenEditorWidths")
            didChangeSize = false
          }

          lastActiveGroup = window.tabGroups.activeTabGroup
          return
        }

        // moved to another editor group
        if (lastActiveGroup !== window.tabGroups.activeTabGroup) {
          // balance the editor widths
          await commands.executeCommand("workbench.action.evenEditorWidths")

          // increase multiple times to make the active editor bigger
          for (let i = 0; i < splitCount + 2; i++) {
            await commands.executeCommand("workbench.action.increaseViewWidth")
          }

          // mark as changed to restore balance later
          didChangeSize = true
        }

        lastActiveGroup = window.tabGroups.activeTabGroup
      }, 20)
    })
  )
}
