import { goToDiagnostic } from "./diagnostics";
import { registerEditorAlwaysPresent } from "./editor-always";
import { registerAutoSidebar } from "./auto-sidebar";
import { peekComplete } from "./peek";
import {
  lazyGit,
  openChangedFiles,
  openFile,
  runCommandForCurrentFile,
  searchInFiles,
} from "./terminal-commands";
import {
  DiagnosticSeverity,
  ExtensionContext,
  commands,
  window,
  workspace,
} from "vscode";
import { registerAutoEditorWidth } from "./auto-editor-width";
import { exec } from "child_process";

/**
 * Register all commands and functionality
 */
export function activate(context: ExtensionContext) {
  // commands
  context.subscriptions.push(
    commands.registerCommand("florencio.openFiles", async () => {
      await openFile(context.extensionPath);
    }),
    commands.registerCommand("florencio.openChangedFiles", async () => {
      await openChangedFiles(context.extensionPath);
    }),
    commands.registerCommand("florencio.searchInFiles", async () => {
      await searchInFiles(context.extensionPath);
    }),
    commands.registerCommand("florencio.searchInFilesEditorCWD", async () => {
      await searchInFiles(context.extensionPath, true);
    }),
    commands.registerCommand("florencio.lazygit", async () => {
      await lazyGit();
    }),
    commands.registerCommand("florencio.peekComplete", async () => {
      await peekComplete();
    }),
    commands.registerCommand("florencio.fx", async () => {
      await runCommandForCurrentFile("fx");
    }),

    commands.registerCommand("florencio.weztermLazyGit", () => {
      const workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;

      let command = "wezterm cli spawn lazygit";

      if (workspaceFolder) {
        command = `wezterm cli spawn --cwd "${workspaceFolder}" lazygit`;
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          window.showErrorMessage(`Failed to open Lazygit: ${error.message}`);
          return;
        }
        if (stderr) {
          window.showWarningMessage(`Lazygit stderr: ${stderr}`);
        }
      });

      // focus
      exec(
        "osascript -e 'tell application \"WezTerm\" to activate'",
        (ascriptError) => {
          if (ascriptError) {
            window.showWarningMessage(`Failed to focus WezTerm: ${ascriptError.message}`);
          }
        },
      );
    }),
  );

  // jump to diagnostics commands
  context.subscriptions.push(
    commands.registerCommand("florencio.goToNextError", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "next");
    }),
    commands.registerCommand("florencio.goToPreviousError", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "prev");
    }),
    commands.registerCommand("florencio.goToNextDiagnostic", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "next", true);
    }),
    commands.registerCommand("florencio.goToPreviousDiagnostic", async () => {
      await goToDiagnostic(DiagnosticSeverity.Error, "prev", true);
    }),
    commands.registerCommand("florencio.goToNextWarning", async () => {
      await goToDiagnostic(DiagnosticSeverity.Warning, "next", true);
    }),
    commands.registerCommand("florencio.goToPreviousWarning", async () => {
      await goToDiagnostic(DiagnosticSeverity.Warning, "prev", true);
    }),
  );

  // Other functionality
  registerAutoSidebar(context);
  registerEditorAlwaysPresent(context);
  registerAutoEditorWidth(context);
}
