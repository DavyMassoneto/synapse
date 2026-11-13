import { type Api, getSupportedThinkingLevels, type Model, type ModelThinkingLevel } from "@earendil-works/pi-ai"
import { type ModelRoute } from "@earendil-works/pi-coding-agent"
import { ROUTER_CANCELLED_KIND, ROUTER_KEPT_KIND, ROUTER_UNAVAILABLE_KIND, type RouteOutcome } from "#synapse/modules"
import { rejectRouterCancellation } from "./cancellation"
import { PI_ROUTER_SELECTED_UNAVAILABLE } from "./constants"
import { type PiRouterContext, type PiRouterState, type RoutePhysicalSelection } from "./types"

export function applyRouterSelection(context: PiRouterContext, outcome: RouteOutcome): ModelRoute<PiRouterState> {
  if (outcome.kind === ROUTER_CANCELLED_KIND) {
    rejectRouterCancellation()
  }
  if (outcome.kind === ROUTER_UNAVAILABLE_KIND) {
    throw new Error(outcome.reason)
  }
  return resolvePhysicalRouterSelection(context, outcome)
}

function resolvePhysicalRouterSelection(
  context: PiRouterContext,
  outcome: RoutePhysicalSelection,
): ModelRoute<PiRouterState> {
  const model = context.modelRegistry.find(outcome.provider, outcome.modelId)
  if (!model || !context.modelRegistry.hasConfiguredAuth(model)) {
    throw new Error(PI_ROUTER_SELECTED_UNAVAILABLE)
  }
  const effort = supportedRouterEffort(model, outcome.effort)
  if (outcome.kind === ROUTER_KEPT_KIND) {
    return { model, thinkingLevel: effort }
  }
  return { model, thinkingLevel: effort, state: { reason: outcome.reason } }
}

function supportedRouterEffort(model: Model<Api>, requested: string): ModelThinkingLevel {
  const effort = getSupportedThinkingLevels(model).find((level) => level === requested)
  if (!effort) {
    throw new Error(PI_ROUTER_SELECTED_UNAVAILABLE)
  }
  return effort
}
