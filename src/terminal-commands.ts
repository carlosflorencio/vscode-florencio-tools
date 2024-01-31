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
  if (!isLocalWorkspaceFolder()) {
    commands.executeCommand("workbench.action.quickOpen")
    return
  }

  return runScriptOpensManyFiles(extensionPath, "find_files.sh")
}

/**
 * Open a fuzzy finder (rg + fzf) to open git changed files
 * File preview with bat
 * Supports opening multiple files
 *
 * Opens as an editor terminal
 */
export async function openChangedFiles(extensionPath: string) {
  if (!isLocalWorkspaceFolder()) {
    // no equivalent fallback command
    return
  }

  return runScriptOpensManyFiles(extensionPath, "find_files_git.sh")
}

/**
 * Find contents in files using rg + fzf
 * File preview with bat
 * Supports opening multiple files
 *
 * Opens as an editor terminal
 */
export async function searchInFiles(extensionPath: string) {
  if (!isLocalWorkspaceFolder()) {
    commands.executeCommand("workbench.action.experimental.quickTextSearch")
    return
  }

  const scriptPath = join(extensionPath, "scripts", "find_in_files.sh")

  const cwd = workspace.workspaceFolders![0].uri.fsPath
  const previousEditor = window.activeTextEditor

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
  if (!isLocalWorkspaceFolder()) {
    commands.executeCommand("workbench.view.scm")
    return
  }

  const previousEditor = window.activeTextEditor

  const terminal = new SingleCommandTerminal({
    name: "lazygit",
  })

  // for some reason, sometimes lazygit doesn't find the right config file
  // let's force it
  const config = "~/.config/lazygit/config.yml"
  const cmd = `lazygit -ucf ${config}`

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

/**
 * Runs a script that can open many files
 */
async function runScriptOpensManyFiles(extensionPath: string, scriptName: string) {
  const scriptPath = join(extensionPath, "scripts", scriptName)

  const cwd = workspace.workspaceFolders![0].uri.fsPath
  const previousEditor = window.activeTextEditor

  const terminal = new SingleCommandTerminal({
    name: `openFiles - ${scriptName}`,
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
 * Determines if the workspace folder is local
 * vscode supports remote filesystems
 */
function isLocalWorkspaceFolder() {
  if (workspace.workspaceFolders?.length === 0) {
    window.showErrorMessage("No workspace folder found")
    return false
  }

  return workspace.workspaceFolders?.[0].uri.scheme === "file"
}
