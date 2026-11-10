import { isPresentObject } from "#evaluator/presence"
import { type FileLines } from "../lines"
import { type DiffState } from "./types"

export function linesOf(state: DiffState): FileLines {
  const existing = state.lines.get(state.path)
  if (isPresentObject(existing)) {
    return existing
  }
  const created = { left: new Set<number>(), right: new Set<number>() }
  state.lines.set(state.path, created)
  return created
}
