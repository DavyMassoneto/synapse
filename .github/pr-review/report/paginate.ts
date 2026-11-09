import { PARAGRAPH_BREAK } from "../separators"
import { MAX_PAGE_CHARS } from "./constants"

export function paginate(lines: string[]): string[] {
  const pages: string[] = []
  let current: string[] = []
  let currentChars = 0
  for (const line of lines) {
    if (current.length > 0 && currentChars + line.length > MAX_PAGE_CHARS) {
      pages.push(current.join(PARAGRAPH_BREAK))
      current = []
      currentChars = 0
    }
    current.push(line)
    currentChars += line.length
  }
  pages.push(current.join(PARAGRAPH_BREAK))
  return pages
}
