import { linesOf } from "./lines-of"
import { type DiffState, type LineKind, type LinePosition } from "./types"

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
