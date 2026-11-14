import { type ClassifierResult } from "@earendil-works/pi-ai"
import { type ClassifierOutcome, ROUTER_CANCELLED_KIND, ROUTER_CHOICE_KIND, ROUTER_FAILED_KIND } from "#synapse/modules"
import {
  PI_ROUTER_ABORTED_REASON,
  PI_ROUTER_CHOICE_TYPE,
  PI_ROUTER_ERROR_REASON,
  PI_ROUTER_INVALID_ANSWER,
  PI_ROUTER_PROVIDER_NOT_CONFIGURED,
  PI_ROUTER_STOP_REASON,
} from "./constants"

export function convertPiRouterClassifierResult(
  result: ClassifierResult,
  question: string,
  signal?: AbortSignal,
): ClassifierOutcome {
  if (signal?.aborted || result.stopReason === PI_ROUTER_ABORTED_REASON) {
    return { kind: ROUTER_CANCELLED_KIND }
  }
  if (result.stopReason === PI_ROUTER_ERROR_REASON && result.errorMessage === PI_ROUTER_PROVIDER_NOT_CONFIGURED) {
    return { kind: ROUTER_FAILED_KIND, reason: PI_ROUTER_PROVIDER_NOT_CONFIGURED }
  }
  const answer = result.answers[question]
  if (result.stopReason !== PI_ROUTER_STOP_REASON || answer?.type !== PI_ROUTER_CHOICE_TYPE) {
    return { kind: ROUTER_FAILED_KIND, reason: PI_ROUTER_INVALID_ANSWER }
  }
  return {
    kind: ROUTER_CHOICE_KIND,
    choice: answer.choice,
    probabilities: Object.entries(answer.probabilities).map(([option, probability]) => ({ option, probability })),
  }
}
