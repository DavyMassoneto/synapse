import { type ClassifierOutcome, type ClassifierRequest, type RouterClassifier } from "#synapse/modules/model-router"

import { ROUTER_DOUBLE_MISSING } from "./constants"

export class RouterClassifierDouble implements RouterClassifier {
  readonly requests: ClassifierRequest[] = []

  outcomes: ClassifierOutcome[] = []

  failure?: Error

  async classify(request: ClassifierRequest): Promise<ClassifierOutcome> {
    this.requests.push(request)
    if (this.failure) {
      throw this.failure
    }
    const outcome = this.outcomes.shift()
    if (!outcome) {
      throw new Error(ROUTER_DOUBLE_MISSING)
    }
    return outcome
  }
}
