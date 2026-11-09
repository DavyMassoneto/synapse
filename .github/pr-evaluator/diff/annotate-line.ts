import {
  ADDED,
  CONTEXT,
  DIFF_FILE_HEADER,
  NEW_FILE_HEADER,
  NEW_PREFIX,
  NEW_START_PATTERN,
  NO_FILE,
  OLD_FILE_HEADER,
  OLD_PREFIX,
  OLD_START_PATTERN,
  REMOVED,
  TAB,
} from "./constants"
import { isHunkHeader, isHunkLine } from "./predicates"
import { linesOf } from "./state"
import { type DiffState } from "./types"

function annotateRemoved(state: DiffState, line: string): string {
  const lineNumber = state.oldLine
  state.oldLine += 1
  linesOf(state).left.add(lineNumber)
  return `L${lineNumber} ${line}`
}

function annotateKept(state: DiffState, line: string, isContext: boolean): string {
  const lineNumber = state.newLine
  state.newLine += 1
  if (isContext) {
    state.oldLine += 1
  }
  linesOf(state).right.add(lineNumber)
  return `R${lineNumber} ${line}`
}

function annotateHunkLine(state: DiffState, line: string): string {
  const marker = line.charAt(0)
  if (marker === REMOVED) {
    return annotateRemoved(state, line)
  }
  if (marker === ADDED || marker === CONTEXT) {
    return annotateKept(state, line, marker === CONTEXT)
  }
  return line
}

function pathOf(header: string, prefix: string): string {
  const tab = header.indexOf(TAB)
  const name = tab === -1 ? header : header.slice(0, tab)
  return name.startsWith(prefix) ? name.slice(prefix.length) : name
}

function readPaths(state: DiffState, line: string): void {
  if (line.startsWith(OLD_FILE_HEADER)) {
    state.oldPath = pathOf(line.slice(OLD_FILE_HEADER.length), OLD_PREFIX)
  }
  if (line.startsWith(NEW_FILE_HEADER)) {
    const name = line.slice(NEW_FILE_HEADER.length)
    state.path = name === NO_FILE ? state.oldPath : pathOf(name, NEW_PREFIX)
  }
}

function startFile(state: DiffState): void {
  state.oldPath = ""
  state.path = ""
  state.inHunk = false
}

function startHunk(state: DiffState, line: string): void {
  state.oldLine = Number(line.replace(OLD_START_PATTERN, "$1"))
  state.newLine = Number(line.replace(NEW_START_PATTERN, "$1"))
  state.inHunk = true
}

export function annotateLine(state: DiffState, line: string): string {
  if (state.inHunk && isHunkLine(line.charAt(0))) {
    return annotateHunkLine(state, line)
  }
  if (line.startsWith(DIFF_FILE_HEADER)) {
    startFile(state)
  } else if (isHunkHeader(line)) {
    startHunk(state, line)
  } else {
    state.inHunk = false
    readPaths(state, line)
  }
  return line
}
