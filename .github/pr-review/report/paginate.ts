import { groupBySize } from "../chunks"
import { PARAGRAPH_BREAK } from "../separators"
import { MAX_PAGE_CHARS } from "./constants"

export function paginate(lines: string[]): string[] {
  return groupBySize(lines, MAX_PAGE_CHARS, (line) => line.length).map((page) => page.join(PARAGRAPH_BREAK))
}
