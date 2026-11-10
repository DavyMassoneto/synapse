import { type DiffState, type LineKind } from "../position-tracking"

export function isHunkBody(state: DiffState, kind: LineKind): boolean {
  return state.inHunk && kind !== "other"
}
