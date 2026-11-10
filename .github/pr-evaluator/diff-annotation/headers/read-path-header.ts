import { pathOf } from "../path-decoding"
import { NEW_FILE_HEADER, NEW_PREFIX, NO_FILE, OLD_FILE_HEADER, OLD_PREFIX } from "./constants"
import { type PathHeader } from "./types"

export function readPathHeader(line: string): PathHeader {
  if (line.startsWith(OLD_FILE_HEADER)) {
    return { kind: "old", path: pathOf(line.slice(OLD_FILE_HEADER.length), OLD_PREFIX) }
  }
  const name = line.slice(NEW_FILE_HEADER.length)
  if (name === NO_FILE) {
    return { kind: "deleted" }
  }
  return { kind: "new", path: pathOf(name, NEW_PREFIX) }
}
