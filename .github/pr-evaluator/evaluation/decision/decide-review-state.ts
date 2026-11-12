import { type GithubConfiguration } from "#evaluator/configuration"
import { readReviewState } from "#evaluator/pull-request-review"
import { MARKER_PREFIX, MARKER_SUFFIX } from "#evaluator/review-text"
import { MESSAGE_ALREADY_REVIEWED } from "./constants"
import { type EvaluationDecision } from "./types"

export async function decideReviewState(github: GithubConfiguration): Promise<EvaluationDecision> {
  const state = await readReviewState(github, `${MARKER_PREFIX}${github.headSha}${MARKER_SUFFIX}`)
  if (state.kind === "reviewed") {
    return { kind: "skip", message: MESSAGE_ALREADY_REVIEWED }
  }
  return { kind: "proceed" }
}
