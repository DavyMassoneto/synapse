import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { callModel, USER_ROLE } from "#evaluator/provider-client"
import { buildPrompt, loadContext } from "#evaluator/review-request"
import { parseReviewResult, type ReviewResult, SUBMIT_REVIEW, SUBMIT_REVIEW_TOOL } from "#evaluator/review-result"
import { readSource } from "#evaluator/source-reading"

export async function askReviewer(configuration: Configuration, diff: AnnotatedDiff): Promise<ReviewResult> {
  const context = loadContext(configuration.root)
  const prompt = buildPrompt(context, { diff: diff.text, source: readSource(configuration.github.headSha) })
  const reply = await callModel(configuration.model, {
    messages: [{ role: USER_ROLE, content: prompt }],
    tools: [SUBMIT_REVIEW_TOOL],
    forcedTool: SUBMIT_REVIEW,
  })
  return parseReviewResult(reply)
}
