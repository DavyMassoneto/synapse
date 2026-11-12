import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { GithubTransportFailure } from "#evaluator/github-rest-client"
import { currentHeadSha, publishReview } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { decideReviewState, type EvaluationDecision } from "../decision"
import { MESSAGE_SUPERSEDED } from "./constants"
import { prepareReview } from "./prepare-review"
import { reconcilePublication } from "./reconcile-publication"
import { recordReview } from "./record-review"
import { type PreparedReview } from "./types"

async function recheckBeforePublishing(github: GithubConfiguration): Promise<EvaluationDecision> {
  const currentSha = await currentHeadSha(github)
  if (currentSha !== github.headSha) {
    return { kind: "skip", message: MESSAGE_SUPERSEDED }
  }
  return decideReviewState(github)
}

export async function publishIfCurrent(
  github: GithubConfiguration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<string> {
  recordReview(result)
  const decision = await recheckBeforePublishing(github)
  if (decision.kind === "skip") {
    return decision.message
  }
  const prepared = prepareReview(github.headSha, diff, result)
  return publishPreparedReview(github, prepared)
}

async function publishPreparedReview(github: GithubConfiguration, prepared: PreparedReview): Promise<string> {
  try {
    const published = await publishReview(github, prepared.body, prepared.comments)
    return `Review ${published.html_url}: ${prepared.comments.length} comentário(s) em linhas do diff e ${prepared.unplacedCount} apontamento(s) sem linha no diff`
  } catch (error) {
    if (error instanceof GithubTransportFailure) {
      console.log(error.message)
      return reconcilePublication(github)
    }
    throw error
  }
}
