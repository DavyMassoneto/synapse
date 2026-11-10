import { type AnnotatedDiff } from "#evaluator/changes"
import { type GithubConfiguration } from "#evaluator/configuration"
import { decideContent } from "./decide-content"
import { decideReviewState } from "./decide-review-state"
import { type EvaluationDecision } from "./types"

export async function decideEvaluation(
  github: GithubConfiguration,
  text: string,
  diff: AnnotatedDiff,
): Promise<EvaluationDecision> {
  const reviewDecision = await decideReviewState(github)
  if (reviewDecision.kind === "skip") {
    return reviewDecision
  }
  return decideContent(text, diff)
}
