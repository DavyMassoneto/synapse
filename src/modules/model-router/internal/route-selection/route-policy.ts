import {
  ROUTER_KEPT_KIND,
  ROUTER_RESERVE_KIND,
  ROUTER_UNAVAILABLE_KIND,
  ROUTER_UNAVAILABLE_REASON,
  type RouteOutcome,
  type RouteRequest,
  type RouterCandidate,
  type RouterPrevious,
  type RouterReserveOutcome,
} from "#synapse/modules/model-router/public/contracts"
import {
  ROUTER_IMAGE_INPUT,
  ROUTER_LEGACY_EFFORT_PREFERENCE,
  ROUTER_LEGACY_EFFORT_UNAVAILABLE,
  ROUTER_REQUIRED_PROVIDER,
  ROUTER_RESERVE_EFFORT,
  ROUTER_RESERVE_MODEL,
  ROUTER_RESERVE_PREFIX,
} from "./constants"

export function eligibleRouterCandidates(candidates: readonly RouterCandidate[]): RouterCandidate[] {
  return candidates.filter(
    (candidate) =>
      candidate.provider === ROUTER_REQUIRED_PROVIDER &&
      candidate.authorized &&
      candidate.input.includes(ROUTER_IMAGE_INPUT),
  )
}

export function reserveRouterRoute(request: RouteRequest, reason: string): RouterReserveOutcome {
  const model = request.candidates.find(
    (candidate) => candidate.provider === ROUTER_REQUIRED_PROVIDER && candidate.id === ROUTER_RESERVE_MODEL,
  )
  if (!model?.authorized || !model.efforts.includes(ROUTER_RESERVE_EFFORT)) {
    return { kind: ROUTER_UNAVAILABLE_KIND, reason: ROUTER_UNAVAILABLE_REASON }
  }
  return {
    kind: ROUTER_RESERVE_KIND,
    provider: model.provider,
    modelId: model.id,
    effort: ROUTER_RESERVE_EFFORT,
    reason: ROUTER_RESERVE_PREFIX + reason,
  }
}

export function keepRouterPhysicalPair(pair: RouterPrevious): RouteOutcome {
  if (pair.effort) {
    return { kind: ROUTER_KEPT_KIND, provider: pair.provider, modelId: pair.modelId, effort: pair.effort }
  }
  return legacyRouterRoute(pair)
}

function legacyRouterRoute(pair: RouterPrevious): RouteOutcome {
  const effort = ROUTER_LEGACY_EFFORT_PREFERENCE.find((level) => pair.efforts.includes(level))
  if (!effort) {
    return { kind: ROUTER_UNAVAILABLE_KIND, reason: ROUTER_LEGACY_EFFORT_UNAVAILABLE }
  }
  return { kind: ROUTER_KEPT_KIND, provider: pair.provider, modelId: pair.modelId, effort }
}
