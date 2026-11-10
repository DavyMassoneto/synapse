import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { currentHeadSha, type PublishedReview, publishReview } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { decideReviewState, type EvaluationDecision } from "../decision"
import { MESSAGE_SUPERSEDED } from "./constants"
import { prepareReview } from "./prepare-review"
import { type PreparedReview } from "./types"

async function recheckBeforePublishing(github: GithubConfiguration): Promise<EvaluationDecision> {
  const currentSha = await currentHeadSha(github)
  if (currentSha !== github.headSha) {
    return { kind: "skip", message: MESSAGE_SUPERSEDED }
  }
  return decideReviewState(github)
}

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
