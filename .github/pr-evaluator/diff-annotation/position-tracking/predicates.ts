import { HUNK_MARKER_KINDS } from "./constants"
import { type HunkMarker } from "./types"

export function isHunkMarker(marker: string): marker is HunkMarker {
  return Object.hasOwn(HUNK_MARKER_KINDS, marker)
}
