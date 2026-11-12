import {
  type RouterChoiceProbability,
  type RouterClassifierChoice,
} from "#synapse/modules/model-router/public/contracts"
import { ROUTER_INVALID_CHOICE, ROUTER_PROBABILITY_SUM_TOLERANCE } from "./constants"
import { isRouterProbability } from "./predicates"

export function selectValidatedRouterChoice(answer: RouterClassifierChoice, options: string[]): string {
  if (!options.includes(answer.choice) || answer.probabilities.length !== options.length) {
    throw new Error(ROUTER_INVALID_CHOICE)
  }
  const available = new Set<string>(options)
  let total = 0
  let largest = 0
  const seen = new Set<string>()
  for (const entry of answer.probabilities) {
    const value = validateAndTrackRouterProbability(entry, available, seen)
    total += value
    largest = Math.max(largest, value)
  }
  const chosen = answer.probabilities.find((entry) => entry.option === answer.choice)
  if (!chosen || Math.abs(total - 1) > ROUTER_PROBABILITY_SUM_TOLERANCE || chosen.probability < largest) {
    throw new Error(ROUTER_INVALID_CHOICE)
  }
  return answer.choice
}

function validateAndTrackRouterProbability(
  entry: RouterChoiceProbability,
  options: Set<string>,
  seen: Set<string>,
): number {
  validateRouterOption(entry.option, options, seen)
  validateRouterProbability(entry.probability)
  seen.add(entry.option)
  return entry.probability
}

function validateRouterOption(option: string, options: Set<string>, seen: Set<string>): void {
  if (!options.has(option) || seen.has(option)) {
    throw new Error(ROUTER_INVALID_CHOICE)
  }
}

function validateRouterProbability(value: number): void {
  if (!isRouterProbability(value)) {
    throw new Error(ROUTER_INVALID_CHOICE)
  }
}
