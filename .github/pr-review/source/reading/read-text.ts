import { readFileSync } from "node:fs"
import { LINE_BREAK, NO_TEXT, TEXT_ENCODING } from "#synapse/separators"
import { type OptionalLines } from "./types"

export function readText(path: string): string {
  return readFileSync(path, { encoding: TEXT_ENCODING })
}

export function tryReadTextLines(path: string): OptionalLines {
  let text: string
  try {
    text = new TextDecoder(TEXT_ENCODING, { fatal: true }).decode(readFileSync(path))
  } catch {
    return undefined
  }
  const lines = text.split(LINE_BREAK)
  if (lines.at(-1) === NO_TEXT) {
    lines.pop()
  }
  return lines
}
