import { type AnnotatedDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { publishReview } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { prepareReview } from "./prepare-review"
import { reportPublication } from "./report-publication"

export async function publishEvaluation(
  configuration: Configuration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<void> {
  const prepared = prepareReview(configuration.github, diff, result)
  reportPublication(await publishReview(configuration.github, prepared.payload), prepared)
}
