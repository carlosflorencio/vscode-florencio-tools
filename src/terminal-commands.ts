import { workspace, commands, window, Uri, Range } from "vscode"
import { SingleCommandTerminal } from "./terminal"
import { join } from "path"

/**
 * Open a fuzzy finder (rg + fzf) to open files
 * File preview with bat
 * Supports opening multiple files
 * 
 * Opens as an editor terminal
 */
export async function openFile(extensionPath: string) {
  const scriptPath = join(extensionPath, "scripts", "find_files.sh")
  const cwd = workspace.workspaceFolders?.[0].uri.fsPath
  const previousEditor = window.activeTextEditor

  if (!cwd) {
    window.showErrorMessage("No workspace folder found")
    return
  }

  const terminal = new SingleCommandTerminal({
    name: "openFile",
  })

  const cmd = `sh ${scriptPath}`

  const result = await terminal.run(cmd.trim())

  if (result.length > 0) {
    const filesToOpen = result.map((f) => Uri.file(join(cwd, f)))
    const promises = filesToOpen.map((f) => workspace.openTextDocument(f))
    const docs = await Promise.all(promises)

    for (const doc of docs) {
      await window.showTextDocument(doc, { preview: docs.length === 1 })
    }
  } else {
    // Focus the previous editor
    if (previousEditor) {
      await window.showTextDocument(
        previousEditor.document,
        previousEditor.viewColumn
      )
    }
  }
}

/**
 * Find contents in files using rg + fzf
 * File preview with bat
 * Supports opening multiple files
 * 
 * Opens as an editor terminal
 */
export async function searchInFiles(extensionPath: string) {
  const scriptPath = join(extensionPath, "scripts", "find_in_files.sh")

  const cwd = workspace.workspaceFolders?.[0].uri.fsPath
  const previousEditor = window.activeTextEditor

  if (!cwd) {
    window.showErrorMessage("No workspace folder found")
    return
  }

  const terminal = new SingleCommandTerminal({
    name: "searchInFiles",
  })

  const cmd = `sh ${scriptPath}`

  const result = await terminal.run(cmd.trim())

  if (result.length > 0) {
    // open files
    for (const r of result) {
      const parts = r.split(":")
      const file = parts[0]
      const line = Number(parts[1])
      const col = Number(parts[2])
      const doc = await workspace.openTextDocument(Uri.file(join(cwd, file)))
      await window.showTextDocument(doc, {
        preview: result.length === 1,
        selection: new Range(line - 1, col - 1, line - 1, col - 1),
      })
    }
  } else {
    // Focus the previous editor
    if (previousEditor) {
      await window.showTextDocument(
        previousEditor.document,
        previousEditor.viewColumn
      )
    }
  }
}

/**
 * Opens a terminal with lazygit maximized
 */
export async function lazyGit() {
  const previousEditor = window.activeTextEditor

  const terminal = new SingleCommandTerminal({
    name: "lazygit",
  })

  const cmd = "lazygit"

  await commands.executeCommand("workbench.action.toggleMaximizeEditorGroup")

  await terminal.run(cmd)

  await commands.executeCommand("workbench.action.toggleMaximizeEditorGroup")

  // Focus the previous editor
  if (previousEditor) {
    await window.showTextDocument(
      previousEditor.document,
      previousEditor.viewColumn
    )
  }
}
