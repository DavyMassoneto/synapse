import { type ChangedFile } from "../diff"
import { LINE_BREAK } from "../separators"
import { fillTemplate } from "../templates"
import { SOURCE_SECTION, UNREADABLE_SECTION } from "./constants"
import { tryReadTextLines } from "./read-text-lines"
import { renderLine } from "./render-line"
import { truncate } from "./truncate"
import { type Source } from "./types"

export function renderSource(file: ChangedFile): Source {
  const lines = tryReadTextLines(file.path)
  if (lines === undefined) {
    return { path: file.path, text: fillTemplate(UNREADABLE_SECTION, [file.path]), incomplete: true }
  }
  const body = lines.map((text, index) => renderLine(index + 1, text, file.addedLines)).join(LINE_BREAK)
  const section = fillTemplate(SOURCE_SECTION, [file.path, String(lines.length), body])
  const truncated = truncate(section)
  return { path: file.path, text: truncated.text, incomplete: truncated.truncated }
}
