import { ADDED_LINE_MARK } from "../diff"
import { fillTemplate } from "../templates"
import { LINE_NUMBER_WIDTH, SOURCE_LINE, UNCHANGED_MARK } from "./constants"

export function renderLine(number: number, text: string, addedLines: Set<number>): string {
  const mark = addedLines.has(number) ? ADDED_LINE_MARK : UNCHANGED_MARK
  return fillTemplate(SOURCE_LINE, [String(number).padStart(LINE_NUMBER_WIDTH), mark, text])
}
