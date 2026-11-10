import { readHunkStart, readPathHeader } from "../headers"
import { type DiffState, type LineKind, type LinePosition } from "./types"

function startFile(state: DiffState): void {
  state.oldPath = ""
  state.path = ""
  state.inHunk = false
}

function startHunk(state: DiffState, line: string): void {
  const start = readHunkStart(line)
  state.oldLine = start.oldLine
  state.newLine = start.newLine
  state.inHunk = true
}

function recordPaths(state: DiffState, line: string): void {
  const header = readPathHeader(line)
  if (header.kind === "old") {
    state.oldPath = header.path
  }
  if (header.kind === "new") {
    state.path = header.path
  }
  if (header.kind === "deleted") {
    state.path = state.oldPath
  }
}

export function applyHeaderLine(state: DiffState, kind: LineKind, line: string): LinePosition {
  if (kind === "file-header") {
    startFile(state)
  } else if (kind === "hunk-header") {
    startHunk(state, line)
  } else if (kind === "path-header") {
    recordPaths(state, line)
  } else {
    state.inHunk = false
  }
  return { kind: "none" }
}
