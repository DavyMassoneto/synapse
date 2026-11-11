import { LINE_BREAK } from "./constants"

export function* splitInspectionLines(text: string, startLine: number): Generator<string> {
  let start = 0
  let line = 1
  while (line < startLine && start <= text.length) {
    const boundary = text.indexOf(LINE_BREAK, start)
    start = boundary < 0 ? text.length + 1 : boundary + 1
    line += 1
  }
  while (start < text.length) {
    const boundary = text.indexOf(LINE_BREAK, start)
    const end = boundary < 0 ? text.length : boundary
    yield text.slice(start, end)
    start = end + 1
  }
}
