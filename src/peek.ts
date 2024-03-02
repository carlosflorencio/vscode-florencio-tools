import { commands, window, Disposable } from "vscode"

/**
 * This function removes the text selection after opening an editor from the peek view
 * It's designed to improve Developer Experience (DX).
 *
 * To use this function, add the following configuration to your keybindings.json file:
 *
 * {
 *   "key": "enter",
 *   "command": "runCommands",
 *   "args": {
 *     "commands": ["openReferenceToSide", "closeReferenceSearch", "florencio.peekComplete"]
 *   },
 *   "when": "listFocus && !inputFocus && referenceSearchVisible"
 * }
 */
export async function peekComplete() {
  /**
   * This listener is used to remove the text selection after opening an editor
   * When the peekComplete() is called, the current activeEditor is still the previous one
   */
  let disposable: Disposable | undefined
  disposable = window.onDidChangeActiveTextEditor(async (editor) => {
    await commands.executeCommand("cancelSelection")

    // remove this listener
    disposable?.dispose()
  })
}
