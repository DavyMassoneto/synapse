import { runReviewAgent } from "#evaluator/agent-launch"
import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { buildPrompt, loadContext } from "#evaluator/review-request"
import { type ReviewResult } from "#evaluator/review-result"

export function askReviewer(configuration: Configuration, diff: AnnotatedDiff): ReviewResult {
  const prompt = buildPrompt(loadContext(configuration.root))
  return runReviewAgent(configuration.model, configuration.github.headSha, diff.text, prompt)
}
