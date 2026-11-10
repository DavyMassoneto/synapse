import { DIFF_FILE_HEADER, HUNK_START_PATTERN, isPathHeader, readHunkStart, readPathHeader } from "../headers"
import { type DiffState } from "./types"

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
  } else if (header.kind === "new") {
    state.path = header.path
  } else {
    state.path = state.oldPath
  }
}

export function applyHeaderLine(state: DiffState, line: string): void {
  if (line.startsWith(DIFF_FILE_HEADER)) {
    startFile(state)
  } else if (HUNK_START_PATTERN.test(line)) {
    startHunk(state, line)
  } else if (isPathHeader(line)) {
    recordPaths(state, line)
  } else {
    state.inHunk = false
  }
}
