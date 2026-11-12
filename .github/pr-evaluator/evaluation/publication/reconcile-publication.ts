import { setTimeout as delay } from "node:timers/promises"
import { type GithubConfiguration } from "#evaluator/configuration"
import { GithubTransportFailure } from "#evaluator/github-rest-client"
import { currentHeadSha } from "#evaluator/pull-request-review"
import { decideReviewState } from "../decision"
import {
  PUBLICATION_RECONCILED,
  PUBLICATION_UNCERTAIN,
  RECONCILIATION_ATTEMPTS,
  RECONCILIATION_DELAY_MS,
  RECONCILIATION_FAILURE,
  RECONCILIATION_HEAD,
} from "./constants"

export async function reconcilePublication(github: GithubConfiguration): Promise<string> {
  for (let attempt = 1; attempt <= RECONCILIATION_ATTEMPTS; attempt += 1) {
    try {
      const currentSha = await currentHeadSha(github)
      const decision = await decideReviewState(github)
      if (decision.kind === "skip") {
        return PUBLICATION_RECONCILED
      }
      if (currentSha !== github.headSha) {
        throw new Error(`${PUBLICATION_UNCERTAIN}${RECONCILIATION_HEAD}${JSON.stringify(currentSha)}`)
      }
    } catch (error) {
      if (error instanceof GithubTransportFailure) {
        console.log(`${RECONCILIATION_FAILURE}${error.message}`)
      } else {
        throw error
      }
    }
    if (attempt < RECONCILIATION_ATTEMPTS) {
      await delay(RECONCILIATION_DELAY_MS)
    }
  }
  throw new Error(PUBLICATION_UNCERTAIN)
}
