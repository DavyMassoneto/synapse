import { applyHeaderLine } from "./apply-header-line"
import { applyHunkLine } from "./apply-hunk-line"
import { HUNK_MARKER_KINDS } from "./constants"
import { isHunkMarker } from "./predicates"
import { type DiffState, type LinePosition } from "./types"

export function trackLine(state: DiffState, line: string): LinePosition {
  const marker = line.charAt(0)
  if (state.inHunk && isHunkMarker(marker)) {
    return applyHunkLine(state, HUNK_MARKER_KINDS[marker])
  }
  applyHeaderLine(state, line)
  return { kind: "none" }
}
