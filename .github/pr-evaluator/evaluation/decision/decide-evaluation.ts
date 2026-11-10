import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { decideContent } from "./decide-content"
import { decideReviewState } from "./decide-review-state"
import { type EvaluationDecision } from "./types"

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
