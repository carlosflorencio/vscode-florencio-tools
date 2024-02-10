import { commands } from "vscode"

/**
 * Close the peek window and cancel the selection
 * This is a small DX improvement
 */
export async function peekComplete() {
  await commands.executeCommand("closeReferenceSearch")
  await commands.executeCommand("cancelSelection")
}
