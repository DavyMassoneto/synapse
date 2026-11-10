import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { MESSAGE_EMPTY_DIFF, MESSAGE_NO_TEXT_LINES } from "./constants"
import { decideReviewState } from "./decide-review-state"
import { type EvaluationDecision } from "./types"

function decideContent(rawDiff: string, diff: AnnotatedDiff): EvaluationDecision {
  if (rawDiff.length === 0) {
    return { kind: "skip", message: MESSAGE_EMPTY_DIFF }
  }
  if (diff.lines.size === 0) {
    return { kind: "skip", message: MESSAGE_NO_TEXT_LINES }
  }
  return { kind: "proceed" }
}

export async function decideEvaluation(
  github: GithubConfiguration,
  rawDiff: string,
  diff: AnnotatedDiff,
): Promise<EvaluationDecision> {
  const reviewDecision = await decideReviewState(github)
  if (reviewDecision.kind === "skip") {
    return reviewDecision
  }
  return decideContent(rawDiff, diff)
}
