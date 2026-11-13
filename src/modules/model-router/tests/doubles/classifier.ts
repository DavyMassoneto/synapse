import { type ClassifierOutcome, type ClassifierRequest, type RouterClassifier } from "#synapse/modules/model-router"
import { ROUTER_TEST_MISSING_REQUEST, ROUTER_TEST_VALID_CHOICE } from "./constants"

export class RouterTestClassifier implements RouterClassifier {
  outcome = ROUTER_TEST_VALID_CHOICE

  requests: ClassifierRequest[] = []

  async classify(request: ClassifierRequest): Promise<ClassifierOutcome> {
    this.requests.push(request)
    return this.outcome
  }

  requireRequest(): ClassifierRequest {
    const request = this.requests[0]
    if (!request) {
      throw new Error(ROUTER_TEST_MISSING_REQUEST)
    }
    return request
  }
}
