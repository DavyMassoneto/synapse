import { LINE_BREAK } from "../separators"
import { ADDED_LINE_MARK, CONTEXT_LINE_MARK } from "./constants"
import { hunkStart } from "./hunk-start"
import { type LineNumbers } from "./types"

export function collectLineNumbers(section: string): LineNumbers {
  const lines: LineNumbers = { added: new Set<number>(), commentable: new Set<number>() }
  let number = 0
  for (const diffLine of section.split(LINE_BREAK)) {
    const start = hunkStart(diffLine)
    if (start !== undefined) {
      number = start
    } else if (number > 0 && diffLine.startsWith(ADDED_LINE_MARK)) {
      lines.added.add(number)
      lines.commentable.add(number)
      number += 1
    } else if (number > 0 && diffLine.startsWith(CONTEXT_LINE_MARK)) {
      lines.commentable.add(number)
      number += 1
    }
  }
  return lines
}
