import { type AnnotatedDiff } from "#evaluator/changes"
import { MESSAGE_EMPTY_DIFF, MESSAGE_NO_TEXT_LINES } from "./constants"
import { type EvaluationDecision } from "./types"

export function decideContent(rawDiff: string, diff: AnnotatedDiff): EvaluationDecision {
  if (rawDiff.trim().length === 0) {
    return { kind: "skip", message: MESSAGE_EMPTY_DIFF }
  }
  if (diff.lines.size === 0) {
    return { kind: "skip", message: MESSAGE_NO_TEXT_LINES }
  }
  return { kind: "proceed" }
}
