import {
  type RouterChoiceProbability,
  type RouterClassifierChoice,
} from "#synapse/modules/model-router/public/contracts"
import {
  ROUTER_INVALID_CHOICE,
  ROUTER_PROBABILITY_FOUND,
  ROUTER_PROBABILITY_MISSING,
  ROUTER_PROBABILITY_SUM_TOLERANCE,
} from "./constants"
import { isRouterProbability } from "./predicates"
import { type RouterChosenProbability } from "./types"

export function selectValidatedRouterChoice(answer: RouterClassifierChoice, options: string[]): string {
  const available = new Set<string>(options)
  if (!available.has(answer.choice) || answer.probabilities.length !== options.length) {
    throw new Error(ROUTER_INVALID_CHOICE)
  }
  let total = 0
  let largest = 0
  const seen = new Set<string>()
  let chosen: RouterChosenProbability = { kind: ROUTER_PROBABILITY_MISSING }
  for (const entry of answer.probabilities) {
    const value = validateAndTrackRouterProbability(entry, available, seen)
    if (entry.option === answer.choice) {
      chosen = { kind: ROUTER_PROBABILITY_FOUND, probability: value }
    }
    total += value
    largest = Math.max(largest, value)
  }
  if (
    chosen.kind === ROUTER_PROBABILITY_MISSING ||
    Math.abs(total - 1) > ROUTER_PROBABILITY_SUM_TOLERANCE ||
    chosen.probability < largest
  ) {
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
