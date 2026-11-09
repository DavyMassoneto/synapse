import { LINE_BREAK } from "../separators"
import { DIFF_SEPARATOR } from "./constants"

export function splitSections(diff: string): string[] {
  return (LINE_BREAK + diff).split(DIFF_SEPARATOR).slice(1)
}
