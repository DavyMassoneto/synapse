import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { MESSAGE_EMPTY_DIFF, MESSAGE_NO_TEXT_LINES } from "./constants"
import { hasDiffContent } from "./predicates"
import { type EvaluationDecision } from "./types"

export function decideContent(rawDiff: string, diff: AnnotatedDiff): EvaluationDecision {
  if (!hasDiffContent(rawDiff)) {
    return { kind: "skip", message: MESSAGE_EMPTY_DIFF }
  }
  if (diff.lines.size === 0) {
    return { kind: "skip", message: MESSAGE_NO_TEXT_LINES }
  }
  return { kind: "proceed" }
}
