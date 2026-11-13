import { type GithubConfiguration } from "#evaluator/configuration"
import { currentHeadSha } from "#evaluator/pull-request-review"
import { decideReviewState } from "../decision"
import { ABSENT_PUBLICATION, RECONCILED_PUBLICATION, SUPERSEDED_PUBLICATION } from "./constants"
import { type PublicationObservation } from "./types"

export async function observePublication(github: GithubConfiguration): Promise<PublicationObservation> {
  const currentSha = await currentHeadSha(github)
  const decision = await decideReviewState(github)
  if (decision.kind === "skip") {
    return { kind: RECONCILED_PUBLICATION }
  }
  if (currentSha !== github.headSha) {
    return { kind: SUPERSEDED_PUBLICATION, currentSha }
  }
  return { kind: ABSENT_PUBLICATION }
}
