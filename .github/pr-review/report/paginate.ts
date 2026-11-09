import { PARAGRAPH_BREAK } from "../separators"
import { fillTemplate } from "../templates"
import { MAX_PAGE_CHARS, SUMMARY_MARKER, TITLE_CONTINUATION } from "./constants"

export function paginate(lines: string[]): string[] {
  const pages: string[] = []
  let page = pageHeading(0)
  let lineCount = 0
  for (const line of lines) {
    if (lineCount > 0 && page.length + PARAGRAPH_BREAK.length + line.length > MAX_PAGE_CHARS) {
      pages.push(page)
      page = pageHeading(pages.length)
      lineCount = 0
    }
    page += PARAGRAPH_BREAK + line
    lineCount += 1
  }
  if (lineCount > 0) {
    pages.push(page)
  }
  return pages
}

export function pageHeading(index: number): string {
  const marker = fillTemplate(SUMMARY_MARKER, [String(index)])
  if (index === 0) {
    return marker
  }
  return marker + PARAGRAPH_BREAK + fillTemplate(TITLE_CONTINUATION, [String(index + 1)])
}
