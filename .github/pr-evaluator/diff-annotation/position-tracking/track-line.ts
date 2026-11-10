import { type FileLines } from "../lines"
import { applyHeaderLine } from "./apply-header-line"
import { ADDED, CONTEXT, NO_NEWLINE, REMOVED } from "./constants"
import { type DiffState, type LinePosition } from "./types"

function linesOf(state: DiffState): FileLines {
  const existing = state.lines.get(state.path)
  if (existing) {
    return existing
  }
  const created = { LEFT: new Set<number>(), RIGHT: new Set<number>() }
  state.lines.set(state.path, created)
  return created
}

function takeOldLine(state: DiffState): LinePosition {
  const line = state.oldLine
  state.oldLine += 1
  linesOf(state).LEFT.add(line)
  return { kind: "left", line }
}

function takeNewLine(state: DiffState): LinePosition {
  const line = state.newLine
  state.newLine += 1
  linesOf(state).RIGHT.add(line)
  return { kind: "right", line }
}

function takeContextLine(state: DiffState): LinePosition {
  const line = state.newLine
  const file = linesOf(state)
  file.LEFT.add(state.oldLine)
  file.RIGHT.add(line)
  state.oldLine += 1
  state.newLine += 1
  return { kind: "right", line }
}

export function trackLine(state: DiffState, line: string): LinePosition {
  if (state.inHunk) {
    const marker = line.charAt(0)
    if (marker === ADDED) {
      return takeNewLine(state)
    }
    if (marker === REMOVED) {
      return takeOldLine(state)
    }
    if (marker === CONTEXT) {
      return takeContextLine(state)
    }
    if (marker === NO_NEWLINE) {
      return { kind: "none" }
    }
  }
  applyHeaderLine(state, line)
  return { kind: "none" }
}
