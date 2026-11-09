import { HUNK_HEADER } from "./constants"
import { type OptionalNumber } from "./types"

export function hunkStart(diffLine: string): OptionalNumber {
  const start = HUNK_HEADER.exec(diffLine)?.at(1)
  if (start === undefined) {
    return undefined
  }
  return Number(start)
}
