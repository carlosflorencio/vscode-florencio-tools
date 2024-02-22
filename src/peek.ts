import { commands } from "vscode"

/**
 * This function closes the peek window and cancels the selection.
 * It's designed to improve Developer Experience (DX).
 *
 * To use this function, add the following configuration to your keybindings.json file:
 *
 * {
 *   "key": "enter",
 *   "command": "runCommands",
 *   "args": {
 *     "commands": ["revealReference", "florencio.peekComplete"]
 *   },
 *   "when": "listFocus && !inputFocus && referenceSearchVisible"
 * }
 *
 * This configuration will trigger the 'peekComplete' function when the 'Enter' key is pressed,
 * provided that the list is in focus, the input is not in focus, and the reference search is visible.
 */
export async function peekComplete() {
  await commands.executeCommand("closeReferenceSearch") // close peek window
  await commands.executeCommand("cancelSelection") // prevent having the text selected
}
