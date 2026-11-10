import { type AnnotatedDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { type ReviewResult } from "#evaluator/review-result"
import { applyDecision } from "./apply-decision"
import { decidePublication } from "./decide-publication"
import { publishEvaluation } from "./publish-evaluation"

export async function publishIfCurrent(
  configuration: Configuration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<void> {
  const decision = await decidePublication(configuration.github)
  await applyDecision(decision, () => publishEvaluation(configuration, diff, result))
}
