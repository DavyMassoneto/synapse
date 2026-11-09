import { type DiffState, type FileLines } from "./types"

export function createState(): DiffState {
  return { oldPath: "", path: "", inHunk: false, oldLine: 0, newLine: 0, lines: new Map<string, FileLines>() }
}

export function linesOf(state: DiffState): FileLines {
  const existing = state.lines.get(state.path)
  if (existing instanceof Object) {
    return existing
  }
  const created: FileLines = { left: new Set<number>(), right: new Set<number>() }
  state.lines.set(state.path, created)
  return created
}
