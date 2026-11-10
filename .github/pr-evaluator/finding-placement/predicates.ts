import { type DiffLines, hasDiffRange } from "#evaluator/changes"
import { type Finding } from "#evaluator/review-result"
import { type RangedFinding } from "./types"

export function hasValidRange(lines: DiffLines, finding: Finding): finding is RangedFinding {
  return (
    typeof finding.startLine === "number" &&
    hasDiffRange(lines, finding.path, finding.side, finding.startLine, finding.line)
  )
}
