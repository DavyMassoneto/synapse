import { applyLine } from "./apply-line"
import { splitCompleteLines } from "./split-complete-lines"
import { type StreamResult } from "./types"

export function consumeText(result: StreamResult, text: string): string {
  const split = splitCompleteLines(text)
  for (const line of split.lines) {
    applyLine(result, line)
  }
  return split.rest
}
