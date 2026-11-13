import {
  type ModelRouter,
  ROUTER_CANCELLED_KIND,
  ROUTER_CONTINUATION,
  ROUTER_RETRY,
  type RouteOutcome,
  type RouteRequest,
  type RouterClassifier,
} from "#synapse/modules/model-router/public/contracts"
import { selectOrReserve } from "./route-model"
import { keepRouterPhysicalPair } from "./route-policy"

export class ContextualModelRouter implements ModelRouter {
  private readonly classifier: RouterClassifier

  constructor(classifier: RouterClassifier) {
    this.classifier = classifier
  }

  async route(request: RouteRequest): Promise<RouteOutcome> {
    if (request.signal?.aborted) {
      return { kind: ROUTER_CANCELLED_KIND }
    }
    if (request.reason === ROUTER_RETRY && request.failed) {
      return keepRouterPhysicalPair(request.failed)
    }
    if (request.reason === ROUTER_CONTINUATION && request.previous) {
      return keepRouterPhysicalPair(request.previous)
    }
    return selectOrReserve(request, this.classifier)
  }
}
