import { readFileSync } from "node:fs"
import { LINE_BREAK, NO_TEXT } from "../separators"
import { FILE_ENCODING } from "./constants"
import { type OptionalLines } from "./types"

export function tryReadTextLines(path: string): OptionalLines {
  let text: string
  try {
    text = new TextDecoder(FILE_ENCODING, { fatal: true }).decode(readFileSync(path))
  } catch {
    return undefined
  }
  const lines = text.split(LINE_BREAK)
  if (lines.at(-1) === NO_TEXT) {
    lines.pop()
  }
  return lines
}
