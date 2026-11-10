import { type GithubConfiguration } from "#evaluator/configuration"
import { currentHeadSha } from "#evaluator/pull-request-review"
import { MESSAGE_SUPERSEDED } from "./constants"
import { decideReviewState } from "./decide-review-state"
import { type EvaluationDecision } from "./types"

async function decideSuperseded(github: GithubConfiguration): Promise<EvaluationDecision> {
  const currentSha = await currentHeadSha(github)
  if (currentSha !== github.headSha) {
    return { kind: "skip", message: MESSAGE_SUPERSEDED }
  }
  return { kind: "proceed" }
}

export async function recheckBeforePublishing(github: GithubConfiguration): Promise<EvaluationDecision> {
  const superseded = await decideSuperseded(github)
  if (superseded.kind === "skip") {
    return superseded
  }
  return decideReviewState(github)
}
