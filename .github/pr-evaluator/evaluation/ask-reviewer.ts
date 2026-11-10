import { type AnnotatedDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { callModel } from "#evaluator/provider-client"
import { buildPrompt, loadContext } from "#evaluator/review-request"
import { parseReviewResult, type ReviewResult } from "#evaluator/review-result"

export async function askReviewer(configuration: Configuration, diff: AnnotatedDiff): Promise<ReviewResult> {
  const context = loadContext(configuration.root)
  const prompt = buildPrompt(context, diff.text)
  return parseReviewResult(await callModel(configuration.model, prompt))
}
