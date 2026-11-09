import { type DiffState, type LineKind } from "../cursor"
import { isFileHeader, isHunkHeader } from "../headers"
import { ADDED, CONTEXT, NO_NEWLINE, REMOVED } from "./constants"

function classifyHunkMarker(marker: string): LineKind {
  if (marker === ADDED) {
    return "added"
  }
  if (marker === REMOVED) {
    return "removed"
  }
  if (marker === CONTEXT) {
    return "context"
  }
  if (marker === NO_NEWLINE) {
    return "no-newline"
  }
  return "other"
}

export function classifyLine(state: DiffState, line: string): LineKind {
  const hunkKind = classifyHunkMarker(line.charAt(0))
  if (state.inHunk && hunkKind !== "other") {
    return hunkKind
  }
  if (isFileHeader(line)) {
    return "file-header"
  }
  if (isHunkHeader(line)) {
    return "hunk-header"
  }
  return "other"
}
