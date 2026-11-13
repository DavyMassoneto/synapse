import { type Api, getSupportedThinkingLevels, type Model } from "@earendil-works/pi-ai"
import { type ModelRouteRequest } from "@earendil-works/pi-coding-agent"
import { type RouteRequest, type RouterCandidate, type RouterPrevious } from "#synapse/modules"
import { convertRouterMessage } from "./messages"
import { type PiRouterContext, type PiRouterPhysicalPair, type PiRouterState } from "./types"

export function buildPiRouterRequest(
  request: ModelRouteRequest<PiRouterState>,
  context: PiRouterContext,
): RouteRequest {
  const candidates = routerCandidates(context)
  const input: RouteRequest = {
    reason: request.reason,
    messages: request.messages.map(convertRouterMessage),
    candidates,
  }
  if (request.signal) {
    input.signal = request.signal
  }
  if (request.previous) {
    input.previous = convertRouterPair(request.previous)
  }
  if (request.failed) {
    input.failed = convertRouterPair(request.failed)
  }
  return input
}

export function convertRouterPair(pair: PiRouterPhysicalPair): RouterPrevious {
  const converted: RouterPrevious = {
    provider: pair.model.provider,
    modelId: pair.model.id,
    efforts: getSupportedThinkingLevels(pair.model),
  }
  if (pair.thinkingLevel) {
    converted.effort = pair.thinkingLevel
  }
  return converted
}

export function routerCandidates(context: PiRouterContext): RouterCandidate[] {
  return context.modelRegistry.getAvailable().map(toRouterCandidate.bind(null, context))
}

function toRouterCandidate(context: PiRouterContext, model: Model<Api>): RouterCandidate {
  return {
    provider: model.provider,
    authorized: context.modelRegistry.hasConfiguredAuth(model),
    id: model.id,
    name: model.name,
    input: model.input,
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
    efforts: getSupportedThinkingLevels(model),
  }
}
