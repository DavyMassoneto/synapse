import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { publishReview } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { recheckBeforePublishing } from "../decision"
import { prepareReview } from "./prepare-review"

export async function publishIfCurrent(
  github: GithubConfiguration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<string> {
  const decision = await recheckBeforePublishing(github)
  if (decision.kind === "skip") {
    return decision.message
  }
  const prepared = prepareReview(github.headSha, diff, result)
  const published = await publishReview(github, prepared.body, prepared.comments)
  return `Review ${published.html_url}: ${prepared.comments.length} comentário(s) em linhas do diff e ${prepared.unplacedCount} apontamento(s) sem linha no diff`
}
