import { type HunkMarkerKinds } from "./types"

export const HUNK_MARKER_KINDS: HunkMarkerKinds = {
  "+": "added",
  "-": "removed",
  " ": "context",
  "\\": "no-newline",
}
