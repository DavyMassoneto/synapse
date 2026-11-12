import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { runReviewAgent } from "#evaluator/review-agent"
import { buildPrompt, loadContext } from "#evaluator/review-request"
import { type ReviewResult } from "#evaluator/review-result"

export async function askReviewer(configuration: Configuration, diff: AnnotatedDiff): Promise<ReviewResult> {
  const prompt = buildPrompt(loadContext(configuration.root))
  return runReviewAgent(configuration.model, configuration.github.headSha, diff.text, prompt)
}
