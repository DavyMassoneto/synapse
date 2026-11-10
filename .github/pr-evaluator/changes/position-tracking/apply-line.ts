import { applyHeaderLine } from "./apply-header-line"
import { applyHunkLine } from "./apply-hunk-line"
import { isHunkLineKind } from "./predicates"
import { type DiffState, type LineKind, type LinePosition } from "./types"

export function applyLine(state: DiffState, kind: LineKind, line: string): LinePosition {
  if (isHunkLineKind(kind)) {
    return applyHunkLine(state, kind)
  }
  return applyHeaderLine(state, kind, line)
}
