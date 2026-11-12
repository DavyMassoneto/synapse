import { setTimeout as delay } from "node:timers/promises"
import { type GithubConfiguration } from "#evaluator/configuration"
import { GithubTransportFailure } from "#evaluator/github-rest-client"
import {
  PUBLICATION_RECONCILED,
  PUBLICATION_UNCERTAIN,
  RECONCILED_PUBLICATION,
  RECONCILIATION_ATTEMPTS,
  RECONCILIATION_DELAY_MS,
  RECONCILIATION_FAILURE,
  RECONCILIATION_HEAD,
  SUPERSEDED_PUBLICATION,
} from "./constants"
import { observePublication } from "./observe-publication"

export async function reconcilePublication(github: GithubConfiguration): Promise<string> {
  for (let attempt = 1; attempt <= RECONCILIATION_ATTEMPTS; attempt += 1) {
    try {
      const observation = await observePublication(github)
      if (observation.kind === RECONCILED_PUBLICATION) {
        return PUBLICATION_RECONCILED
      }
      if (observation.kind === SUPERSEDED_PUBLICATION) {
        throw new Error(`${PUBLICATION_UNCERTAIN}${RECONCILIATION_HEAD}${JSON.stringify(observation.currentSha)}`)
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
