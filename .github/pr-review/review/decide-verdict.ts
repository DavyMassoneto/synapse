import { VERDICT_ATTENTION, VERDICT_OK } from "./constants"
import { type Finding, type Verdict } from "./types"

export function decideVerdict(findings: Finding[], notes: string[]): Verdict {
  if (findings.length === 0 && notes.length === 0) {
    return VERDICT_OK
  }
  return VERDICT_ATTENTION
}
