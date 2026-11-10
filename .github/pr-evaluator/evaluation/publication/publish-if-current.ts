import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { type PublishedReview, publishReview } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { recheckBeforePublishing } from "../decision"
import { prepareReview } from "./prepare-review"
import { type PreparedReview } from "./types"

function publicationOutcome(published: PublishedReview, prepared: PreparedReview): string {
  return `Review ${published.html_url}: ${prepared.comments.length} comentário(s) em linhas do diff e ${prepared.unplacedCount} apontamento(s) sem linha no diff`
}

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
  return publicationOutcome(published, prepared)
}
