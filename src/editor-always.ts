import { window, commands, ExtensionContext } from "vscode";
import config from "./config";

/**
 * When closing the last editor tab, open a new one to prevent vscode from not having any editors
 *
 * By not having any editors, vim keybindings will not work
 * @param context
 */
export function registerEditorAlwaysPresent(context: ExtensionContext) {
  if (!config.editorAlwaysPresentEnabled()) {
    return;
  }

  // startup without any editor opened?
  if (openTabs() === 0) {
    openDefaultEditor();
  }

  context.subscriptions.push(
    window.onDidChangeVisibleTextEditors(async (editors) => {
      if (!config.editorAlwaysPresentEnabled()) {
        return;
      }

      // closing last text editor
      if (openTabs() === 0 && editors.length === 0) {
        await openDefaultEditor();
        return;
      }
    }),
  );
}

function openTabs() {
  return window.tabGroups.all.map((g) => g.tabs).flat().length;
}

function openDefaultEditor() {
  return commands.executeCommand("vsnetrw.open");
}
