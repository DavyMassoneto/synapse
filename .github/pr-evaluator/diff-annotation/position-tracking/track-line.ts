import { applyHeaderLine } from "./apply-header-line"
import { applyHunkLine } from "./apply-hunk-line"
import { classifyLine } from "./classify-line"
import { isHunkLineKind } from "./predicates"
import { type DiffState, type LinePosition } from "./types"

export function trackLine(state: DiffState, line: string): LinePosition {
  const kind = classifyLine(state, line)
  if (isHunkLineKind(kind)) {
    return applyHunkLine(state, kind)
  }
  return applyHeaderLine(state, kind, line)
}
