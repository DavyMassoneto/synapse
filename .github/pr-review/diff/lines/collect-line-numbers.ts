import { LINE_BREAK } from "#synapse/separators"
import { ADDED_LINE_MARK, CONTEXT_LINE_MARK, HUNK_HEADER } from "./constants"
import { type HunkStartLine, type LineNumbers } from "./types"

export function collectLineNumbers(section: string): LineNumbers {
  const lines: LineNumbers = { added: new Set<number>(), commentable: new Set<number>() }
  let newFileLineNumber = 0
  for (const diffLine of section.split(LINE_BREAK)) {
    const start = hunkStart(diffLine)
    if (start !== undefined) {
      newFileLineNumber = start
    } else if (newFileLineNumber > 0 && diffLine.startsWith(ADDED_LINE_MARK)) {
      lines.added.add(newFileLineNumber)
      lines.commentable.add(newFileLineNumber)
      newFileLineNumber += 1
    } else if (newFileLineNumber > 0 && diffLine.startsWith(CONTEXT_LINE_MARK)) {
      lines.commentable.add(newFileLineNumber)
      newFileLineNumber += 1
    }
  }
  return lines
}

export function hunkStart(diffLine: string): HunkStartLine {
  const start = HUNK_HEADER.exec(diffLine)?.at(1)
  if (start === undefined) {
    return undefined
  }
  return Number(start)
}
