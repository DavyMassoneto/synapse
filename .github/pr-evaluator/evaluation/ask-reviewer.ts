import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { conductReview } from "#evaluator/review-conversation"
import { buildPrompt, loadContext } from "#evaluator/review-request"
import { type ReviewResult } from "#evaluator/review-result"

export function askReviewer(configuration: Configuration, diff: AnnotatedDiff): Promise<ReviewResult> {
  return conductReview(configuration, buildPrompt(loadContext(configuration.root), diff.text))
}
