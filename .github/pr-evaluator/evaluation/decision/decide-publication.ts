import { type GithubConfiguration } from "#evaluator/configuration"
import { decideReviewState } from "./decide-review-state"
import { decideSuperseded } from "./decide-superseded"
import { type EvaluationDecision } from "./types"

export async function decidePublication(github: GithubConfiguration): Promise<EvaluationDecision> {
  const superseded = await decideSuperseded(github)
  if (superseded.kind === "skip") {
    return superseded
  }
  return decideReviewState(github)
}
