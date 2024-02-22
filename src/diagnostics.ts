import { DiagnosticSeverity, window, languages, Diagnostic, Range } from "vscode"

/**
 * Jump to diagnostics without triggering the error hint overlay
 * Also has a hierarchy of severity: error > warning > info > hint
 *
 * Faster than default editor.action.marker.* commands
 */
export async function goToDiagnostic(
    initialType: DiagnosticSeverity,
    direction: "next" | "prev",
    allowDowngrade = false
  ) {
    const editor = window.activeTextEditor
  
    if (!editor) {
      return
    }
  
    const editorDiagnostics = languages.getDiagnostics(editor.document.uri)
  
    if (editorDiagnostics.length === 0) {
      return
    }
  
    const filteredDiagnostics = editorDiagnostics.filter(
      (diagnostic) => diagnostic.severity === initialType
    )
  
    if (filteredDiagnostics.length === 0) {
      if (!allowDowngrade) {
        return
      }
  
      // Downgrade to find the next lower severity diagnostic
      if (initialType === DiagnosticSeverity.Error) {
        return await goToDiagnostic(DiagnosticSeverity.Warning, direction, true)
      } else if (initialType === DiagnosticSeverity.Warning) {
        return await goToDiagnostic(
          DiagnosticSeverity.Information,
          direction,
          true
        )
      } else if (initialType === DiagnosticSeverity.Information) {
        return await goToDiagnostic(DiagnosticSeverity.Hint, direction)
      } else {
        return
      }
    }
  
    filteredDiagnostics.sort((a, b) => {
      return a.range.start.line - b.range.start.line
    })
  
    const aboveDiagnostics = filteredDiagnostics.filter(
      (diagnostic) => diagnostic.range.start.line < editor.selection.start.line
    )
  
    const belowDiagnostics = filteredDiagnostics.filter(
      (diagnostic) => diagnostic.range.start.line > editor.selection.start.line
    )
  
    let moveTo: Diagnostic | undefined
  
    if (direction === "next") {
      moveTo =
        belowDiagnostics.length > 0 ? belowDiagnostics[0] : aboveDiagnostics[0]
    } else {
      moveTo =
        aboveDiagnostics.length > 0
          ? aboveDiagnostics[aboveDiagnostics.length - 1]
          : belowDiagnostics[belowDiagnostics.length - 1]
    }
  
    if (!moveTo) {
      return
    }
  
    const newRange = new Range(
      moveTo.range.start.line,
      moveTo.range.start.character,
      moveTo.range.start.line,
      moveTo.range.start.character
    )
  
    await window.showTextDocument(editor.document, {
      selection: newRange,
    })
  }
  
  