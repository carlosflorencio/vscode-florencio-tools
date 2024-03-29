import { goToDiagnostic } from "./diagnostics"
import { registerEditorAlwaysPresent } from "./editor-always"
import { registerAutoSidebar } from "./auto-sidebar"
import { peekComplete } from "./peek"
import {
  lazyGit,
  openChangedFiles,
  openFile,
  runCommandForCurrentFile,
  searchInFiles,
} from "./terminal-commands"
import {
  DiagnosticSeverity,
  ExtensionContext, commands
} from "vscode"
import { registerAutoEditorWidth } from "./auto-editor-width"

/**
 * Register all commands and functionality
 */
export function activate(context: ExtensionContext) {
  // commands
  context.subscriptions.push(
    commands.registerCommand("florencio.openFiles", async () => {
      await openFile(context.extensionPath)
    }),
    commands.registerCommand("florencio.openChangedFiles", async () => {
      await openChangedFiles(context.extensionPath)
    }),
    commands.registerCommand("florencio.searchInFiles", async () => {
      await searchInFiles(context.extensionPath)
    }),
    commands.registerCommand("florencio.searchInFilesEditorCWD", async () => {
      await searchInFiles(context.extensionPath, true)
    }),
    commands.registerCommand("florencio.lazygit", async () => {
      await lazyGit()
    }),
    commands.registerCommand("florencio.peekComplete", async () => {
      await peekComplete()
    }),
    commands.registerCommand("florencio.fx", async () => {
      await runCommandForCurrentFile("fx")
    })
  )

  // jump to diagnostics commands
  context.subscriptions.push(
    commands.registerCommand("florencio.goToNextError", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "next")
    }),
    commands.registerCommand("florencio.goToPreviousError", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "prev")
    }),
    commands.registerCommand("florencio.goToNextDiagnostic", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "next", true)
    }),
    commands.registerCommand("florencio.goToPreviousDiagnostic", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "prev", true)
    })
  )

  // Other functionality
  registerAutoSidebar(context)
  registerEditorAlwaysPresent(context)
  registerAutoEditorWidth(context)
}
