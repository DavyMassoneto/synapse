import { type GithubConfiguration } from "#evaluator/configuration"
import { readReviewState, reviewMarker } from "#evaluator/pull-request-review"
import { MESSAGE_ALREADY_REVIEWED } from "./constants"
import { type EvaluationDecision } from "./types"

export async function decideReviewState(github: GithubConfiguration): Promise<EvaluationDecision> {
  const state = await readReviewState(github, reviewMarker(github.headSha))
  if (state.kind === "reviewed") {
    return { kind: "skip", message: MESSAGE_ALREADY_REVIEWED }
  }
  return { kind: "proceed" }
}
