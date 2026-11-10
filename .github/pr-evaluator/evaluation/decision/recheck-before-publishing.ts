import { type GithubConfiguration } from "#evaluator/configuration"
import { currentHeadSha } from "#evaluator/pull-request-review"
import { MESSAGE_SUPERSEDED } from "./constants"
import { decideReviewState } from "./decide-review-state"
import { type EvaluationDecision } from "./types"

export async function recheckBeforePublishing(github: GithubConfiguration): Promise<EvaluationDecision> {
  const currentSha = await currentHeadSha(github)
  if (currentSha !== github.headSha) {
    return { kind: "skip", message: MESSAGE_SUPERSEDED }
  }
  return decideReviewState(github)
}
