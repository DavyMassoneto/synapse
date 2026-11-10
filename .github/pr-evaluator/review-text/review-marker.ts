import { MARKER_PREFIX, MARKER_SUFFIX } from "./constants"

export function reviewMarker(headSha: string): string {
  return `${MARKER_PREFIX}${headSha}${MARKER_SUFFIX}`
}
