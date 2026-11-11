import { LINE_BREAK } from "./constants"

export function* splitInspectionLines(text: string): Generator<string> {
  let start = 0
  while (start <= text.length) {
    const boundary = text.indexOf(LINE_BREAK, start)
    const end = boundary < 0 ? text.length : boundary
    yield text.slice(start, end)
    start = end + 1
  }
}
