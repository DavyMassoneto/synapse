import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { callModel } from "#evaluator/provider-client"
import { buildPrompt, loadContext } from "#evaluator/review-request"
import { parseReviewResult, type ReviewResult } from "#evaluator/review-result"
import { readSource } from "#evaluator/source-reading"

export async function askReviewer(configuration: Configuration, diff: AnnotatedDiff): Promise<ReviewResult> {
  const context = loadContext(configuration.root)
  const prompt = buildPrompt(context, { diff: diff.text, source: readSource(configuration.github.headSha) })
  return parseReviewResult(await callModel(configuration.model, prompt))
}
