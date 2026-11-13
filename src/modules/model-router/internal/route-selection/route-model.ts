import {
  ROUTER_CANCELLED_KIND,
  ROUTER_SELECTED_KIND,
  type RouteOutcome,
  type RouteRequest,
  type RouterCandidate,
  type RouterClassifier,
  type RouterClassifierState,
  type RouteSelected,
} from "#synapse/modules/model-router/public/contracts"
import { buildRouterConversation } from "../conversation-window"
import {
  describeRouterCandidate,
  effortRouterQuestion,
  modelRouterQuestion,
  ROUTER_PILOT,
} from "../selection-questions"
import { ROUTER_ABORT_NAME, ROUTER_MISSING_OPTION, ROUTER_SELECTION_REASON, ROUTER_UNKNOWN_FAILURE } from "./constants"
import { eligibleRouterCandidates, reserveRouterRoute } from "./route-policy"
import { chooseRouterOption } from "./selection"

function failedRouterRoute(request: RouteRequest, error: Error): RouteOutcome {
  if (error.name === ROUTER_ABORT_NAME) {
    return { kind: ROUTER_CANCELLED_KIND }
  }
  return reserveRouterRoute(request, error.message)
}

async function selectRequestedRoute(request: RouteRequest, classifier: RouterClassifier): Promise<RouteOutcome> {
  const candidates = eligibleRouterCandidates(request.candidates)
  const state = initialRouterState(request)
  const modelId = await chooseRouterOption(modelRouterQuestion(candidates), state, classifier, request.signal)
  if (modelId.kind === ROUTER_CANCELLED_KIND) {
    return modelId
  }
  const model = selectedRouterCandidate(candidates, modelId.id)
  const effortState = selectedRouterState(state, model)
  const effort = await chooseRouterOption(effortRouterQuestion(model), effortState, classifier, request.signal)
  if (effort.kind === ROUTER_CANCELLED_KIND) {
    return effort
  }
  return selectedRouterRoute(model, effort.id)
}

function initialRouterState(request: RouteRequest): RouterClassifierState {
  const state: RouterClassifierState = { conversation: buildRouterConversation(request.messages), pilot: ROUTER_PILOT }
  if (request.previous) {
    state.previous = request.previous
  }
  return state
}

export async function selectOrReserve(request: RouteRequest, classifier: RouterClassifier): Promise<RouteOutcome> {
  try {
    return await selectRequestedRoute(request, classifier)
  } catch (error) {
    if (request.signal?.aborted) {
      return { kind: ROUTER_CANCELLED_KIND }
    }
    if (error instanceof Error) {
      return failedRouterRoute(request, error)
    }
    return reserveRouterRoute(request, ROUTER_UNKNOWN_FAILURE)
  }
}

function selectedRouterCandidate(candidates: RouterCandidate[], id: string): RouterCandidate {
  const model = candidates.find((candidate) => candidate.id === id)
  if (!model) {
    throw new Error(ROUTER_MISSING_OPTION)
  }
  return model
}

function selectedRouterState(state: RouterClassifierState, model: RouterCandidate): RouterClassifierState {
  return { ...state, selectedModel: describeRouterCandidate(model) }
}

function selectedRouterRoute(model: RouterCandidate, effort: string): RouteSelected {
  return {
    kind: ROUTER_SELECTED_KIND,
    provider: model.provider,
    modelId: model.id,
    effort,
    reason: ROUTER_SELECTION_REASON,
  }
}
