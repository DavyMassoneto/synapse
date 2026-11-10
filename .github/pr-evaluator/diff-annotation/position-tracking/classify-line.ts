import { DIFF_FILE_HEADER, HUNK_START_PATTERN, isPathHeader } from "../headers"
import { ADDED, CONTEXT, NO_NEWLINE, REMOVED } from "./constants"
import { isHunkBody } from "./predicates"
import { type DiffState, type LineKind } from "./types"

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
  if (isHunkBody(state, hunkKind)) {
    return hunkKind
  }
  if (line.startsWith(DIFF_FILE_HEADER)) {
    return "file-header"
  }
  if (HUNK_START_PATTERN.test(line)) {
    return "hunk-header"
  }
  if (isPathHeader(line)) {
    return "path-header"
  }
  return "other"
}
