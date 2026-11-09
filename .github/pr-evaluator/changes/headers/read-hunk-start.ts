import { NEW_START_PATTERN, OLD_START_PATTERN } from "./constants"
import { type HunkStart } from "./types"

export function readHunkStart(line: string): HunkStart {
  return {
    oldLine: Number(line.replace(OLD_START_PATTERN, "$1")),
    newLine: Number(line.replace(NEW_START_PATTERN, "$1")),
  }
}
