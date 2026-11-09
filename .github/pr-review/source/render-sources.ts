import { ADDED_LINE_MARK, type ChangedFile } from "../diff"
import { LINE_BREAK } from "../separators"
import { fillTemplate } from "../templates"
import { LINE_NUMBER_WIDTH, SOURCE_LINE, SOURCE_SECTION, UNCHANGED_MARK, UNREADABLE_SECTION } from "./constants"
import { tryReadTextLines } from "./reading"
import { type Source } from "./types"

export function renderSources(files: ChangedFile[]): Source[] {
  return files.map((file) => renderSource(file))
}

export function renderSource(file: ChangedFile): Source {
  const lines = tryReadTextLines(file.path)
  if (lines === undefined) {
    return { path: file.path, text: fillTemplate(UNREADABLE_SECTION, [file.path]), incomplete: true }
  }
  const body = lines.map((text, index) => renderLine(index + 1, text, file.addedLines)).join(LINE_BREAK)
  const section = fillTemplate(SOURCE_SECTION, [file.path, String(lines.length), body])
  return { path: file.path, text: section, incomplete: false }
}

export function renderLine(number: number, text: string, addedLines: Set<number>): string {
  const mark = addedLines.has(number) ? ADDED_LINE_MARK : UNCHANGED_MARK
  return fillTemplate(SOURCE_LINE, [String(number).padStart(LINE_NUMBER_WIDTH), mark, text])
}
