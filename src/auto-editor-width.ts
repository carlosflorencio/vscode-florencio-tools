import { ExtensionContext, commands, window } from "vscode";
import config from "./config";

let editorGroupSizesEnabled = false;

/**
 * Increments the active editor width when switching between editors groups
 */
export function registerAutoEditorWidth(context: ExtensionContext) {
  if (!config.editorAutoWidthEnabled()) {
    return;
  }

  const checkAndToggleEditorWidths = async () => {
    const splitCount = window.tabGroups.all.length;

    if (splitCount < 3) {
      if (editorGroupSizesEnabled) {
        editorGroupSizesEnabled = false;
        await commands.executeCommand("workbench.action.evenEditorWidths");
      }
      return;
    }

    if (!editorGroupSizesEnabled) {
      editorGroupSizesEnabled = true;
      await commands.executeCommand("workbench.action.minimizeOtherEditors");
    }
  };

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor(async (editor) => {
      if (!editor) {
        return;
      }

      // wait for the editor to be fully active
      setTimeout(checkAndToggleEditorWidths, 20);
    }),
  );

  // Check on startup
  setTimeout(checkAndToggleEditorWidths, 20);
}
