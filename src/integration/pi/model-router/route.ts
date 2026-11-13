import { type ModelRoute, type ModelRouteRequest } from "@earendil-works/pi-coding-agent"
import { type ModelRouterFactory } from "#synapse/modules"
import { checkRouterAbort } from "./cancellation"
import { PiRouterClassifier } from "./classifier"
import { applyRouterSelection } from "./physical-selection"
import { buildPiRouterRequest } from "./route-request"
import { showRouterStatus } from "./status-presentation"
import { type PiRouterContext, type PiRouterState } from "./types"

export class PiModelRouterRoute {
  private readonly router: ModelRouterFactory

  constructor(router: ModelRouterFactory) {
    this.router = router
  }

  async route(request: ModelRouteRequest<PiRouterState>, context: PiRouterContext): Promise<ModelRoute<PiRouterState>> {
    const input = buildPiRouterRequest(request, context)
    const outcome = await this.router(new PiRouterClassifier(context)).route(input)
    checkRouterAbort(request.signal)
    const result = applyRouterSelection(context, outcome)
    showRouterStatus(result, context)
    return result
  }
}
