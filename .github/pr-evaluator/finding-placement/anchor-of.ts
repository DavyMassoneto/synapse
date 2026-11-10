import { type DiffLines, hasDiffLine, hasDiffRange } from "#evaluator/diff-annotation"
import { type Finding } from "#evaluator/review-result"
import { type Anchor } from "./types"

function startLineOf(lines: DiffLines, finding: Finding): number {
  if (finding.startLine && hasDiffRange(lines, finding.path, finding.side, finding.startLine, finding.line)) {
    return finding.startLine
  }
  return finding.line
}

export function anchorOf(lines: DiffLines, finding: Finding): Anchor {
  if (!hasDiffLine(lines, finding.path, finding.side, finding.line)) {
    return { kind: "floating" }
  }
  return {
    kind: "anchored",
    path: finding.path,
    side: finding.side,
    line: finding.line,
    startLine: startLineOf(lines, finding),
  }
}
