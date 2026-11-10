import { pathOf } from "../path-decoding"
import {
  DIFF_FILE_HEADER,
  HUNK_START_PATTERN,
  NEW_FILE_HEADER,
  NEW_PREFIX,
  NO_FILE,
  OLD_FILE_HEADER,
  OLD_PREFIX,
} from "./constants"
import { type DiffState } from "./types"

function startFile(state: DiffState): void {
  state.oldPath = ""
  state.path = ""
  state.inHunk = false
}

function recordOldPath(state: DiffState, line: string): void {
  state.oldPath = pathOf(line.slice(OLD_FILE_HEADER.length), OLD_PREFIX)
}

function recordNewPath(state: DiffState, line: string): void {
  const name = line.slice(NEW_FILE_HEADER.length)
  if (name === NO_FILE) {
    state.path = state.oldPath
  } else {
    state.path = pathOf(name, NEW_PREFIX)
  }
}

function enterOrLeaveHunk(state: DiffState, line: string): void {
  const start = HUNK_START_PATTERN.exec(line)
  if (start) {
    state.oldLine = Number(start[1])
    state.newLine = Number(start[2])
    state.inHunk = true
  } else {
    state.inHunk = false
  }
}

export function applyHeaderLine(state: DiffState, line: string): void {
  if (line.startsWith(DIFF_FILE_HEADER)) {
    startFile(state)
  } else if (line.startsWith(OLD_FILE_HEADER)) {
    recordOldPath(state, line)
  } else if (line.startsWith(NEW_FILE_HEADER)) {
    recordNewPath(state, line)
  } else {
    enterOrLeaveHunk(state, line)
  }
}
