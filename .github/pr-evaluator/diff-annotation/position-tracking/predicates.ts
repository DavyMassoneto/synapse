import { type DiffState, type LineKind } from "./types"

export function isHunkBody(state: DiffState, kind: LineKind): boolean {
  return state.inHunk && kind !== "other"
}

export function isHunkLineKind(kind: LineKind): boolean {
  return kind === "removed" || kind === "added" || kind === "context" || kind === "no-newline"
}
