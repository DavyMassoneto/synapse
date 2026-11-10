import { type FileLines } from "../lines"
import { type DiffState, type LineKind, type LinePosition } from "./types"

function linesOf(state: DiffState): FileLines {
  const existing = state.lines.get(state.path)
  if (existing) {
    return existing
  }
  const created = { left: new Set<number>(), right: new Set<number>() }
  state.lines.set(state.path, created)
  return created
}

function takeOldLine(state: DiffState): LinePosition {
  const line = state.oldLine
  state.oldLine += 1
  linesOf(state).left.add(line)
  return { kind: "left", line }
}

function takeNewLine(state: DiffState): LinePosition {
  const line = state.newLine
  state.newLine += 1
  linesOf(state).right.add(line)
  return { kind: "right", line }
}

function takeContextLine(state: DiffState): LinePosition {
  linesOf(state).left.add(state.oldLine)
  state.oldLine += 1
  return takeNewLine(state)
}

export function applyHunkLine(state: DiffState, kind: LineKind): LinePosition {
  if (kind === "removed") {
    return takeOldLine(state)
  }
  if (kind === "added") {
    return takeNewLine(state)
  }
  if (kind === "context") {
    return takeContextLine(state)
  }
  return { kind: "none" }
}
