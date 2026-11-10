import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { type ReviewResult } from "#evaluator/review-result"
import { applyDecision, recheckBeforePublishing } from "../decision"
import { publishEvaluation } from "./publish-evaluation"

export async function publishIfCurrent(
  configuration: Configuration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<void> {
  const decision = await recheckBeforePublishing(configuration.github)
  await applyDecision(decision, () => publishEvaluation(configuration, diff, result))
}
