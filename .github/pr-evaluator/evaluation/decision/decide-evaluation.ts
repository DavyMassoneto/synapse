import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { MESSAGE_NO_TEXT_LINES } from "./constants"
import { decideReviewState } from "./decide-review-state"
import { type EvaluationDecision } from "./types"

export async function decideEvaluation(github: GithubConfiguration, diff: AnnotatedDiff): Promise<EvaluationDecision> {
  if (diff.lines.size === 0) {
    return { kind: "skip", message: MESSAGE_NO_TEXT_LINES }
  }
  return decideReviewState(github)
}
