import { NEW_PREFIX, NO_FILE, OLD_PREFIX, pathOf } from "../paths"
import { NEW_FILE_HEADER, OLD_FILE_HEADER } from "./constants"
import { type PathHeader } from "./types"

export function readPathHeader(line: string): PathHeader {
  if (line.startsWith(OLD_FILE_HEADER)) {
    return { kind: "old", path: pathOf(line.slice(OLD_FILE_HEADER.length), OLD_PREFIX) }
  }
  if (line.startsWith(NEW_FILE_HEADER)) {
    const name = line.slice(NEW_FILE_HEADER.length)
    if (name === NO_FILE) {
      return { kind: "deleted" }
    }
    return { kind: "new", path: pathOf(name, NEW_PREFIX) }
  }
  return { kind: "none" }
}
