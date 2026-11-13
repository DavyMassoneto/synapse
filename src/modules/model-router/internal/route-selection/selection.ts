import {
  ROUTER_CANCELLED_KIND,
  ROUTER_FAILED_KIND,
  ROUTER_OPTION_CHOSEN,
  type RouterChoiceQuestion,
  type RouterClassifier,
  type RouterClassifierState,
  type RouterOptionOutcome,
} from "#synapse/modules/model-router/public/contracts"
import { selectValidatedRouterChoice } from "../choice-validation"
import { ROUTER_MISSING_OPTION } from "./constants"

export async function chooseRouterOption(
  question: RouterChoiceQuestion,
  state: RouterClassifierState,
  classifier: RouterClassifier,
  signal?: AbortSignal,
): Promise<RouterOptionOutcome> {
  const first = question.options[0]
  if (!first) {
    throw new Error(ROUTER_MISSING_OPTION)
  }
  if (question.options.length === 1) {
    return { kind: ROUTER_OPTION_CHOSEN, id: first.id }
  }
  const result = await classifier.classify({ state, question }, signal)
  if (signal?.aborted || result.kind === ROUTER_CANCELLED_KIND) {
    return { kind: ROUTER_CANCELLED_KIND }
  }

  if (result.kind === ROUTER_FAILED_KIND) {
    throw new Error(result.reason)
  }
  return {
    kind: ROUTER_OPTION_CHOSEN,
    id: selectValidatedRouterChoice(
      result,
      question.options.map((option) => option.id),
    ),
  }
}
