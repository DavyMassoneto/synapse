import {
  INVALID_RANGE,
  LINE_BREAK,
  MAX_OUTPUT_BYTES,
  MAX_PAGE_LINES,
  OUTPUT_LIMIT_ERROR,
  TOTAL_LINES_LABEL,
} from "./constants"
import { type PageRequest, type RenderedPage } from "./types"

export function renderPage(lines: string[], request: PageRequest): RenderedPage {
  if (request.endLine < request.startLine) {
    throw new Error(INVALID_RANGE)
  }
  const endLine = Math.min(request.endLine, request.startLine + MAX_PAGE_LINES - 1, lines.length)
  const page: string[] = [`${TOTAL_LINES_LABEL}${lines.length}`]
  for (let line = request.startLine; line <= endLine; line += 1) {
    page.push(`${line}  ${lines[line - 1]}`)
  }
  const text = page.join(LINE_BREAK)
  if (Buffer.byteLength(text) > MAX_OUTPUT_BYTES) {
    throw new Error(OUTPUT_LIMIT_ERROR)
  }
  return { text, startLine: request.startLine, endLine }
}
