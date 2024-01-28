import { autoCloseSidebar, goToDiagnostic } from "./editors"
import { lazyGit, openFile, searchInFiles } from "./terminal-commands"
import {
  DiagnosticSeverity,
  ExtensionContext,
  commands,
  window,
} from "vscode"

export function activate(context: ExtensionContext) {
  // commands
  context.subscriptions.push(
    commands.registerCommand("florencio.openFiles", async () => {
      await openFile(context.extensionPath)
    }),
    commands.registerCommand("florencio.searchInFiles", async () => {
      await searchInFiles(context.extensionPath)
    }),
    commands.registerCommand("florencio.lazygit", async () => {
      await lazyGit()
    })
  )

  // jump to diagnostics
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

  // events
  // TODO: change this event to when an editor tab group is open or closed
  // TODO: add config to enable/disable this feature
  context.subscriptions.push(
    window.onDidChangeVisibleTextEditors(async () => {
      await autoCloseSidebar()
    })
  )
}
