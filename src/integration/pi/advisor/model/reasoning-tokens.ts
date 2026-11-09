import { type ThinkingLevel } from "#synapse/modules"
import { MODEL_DIAGNOSTICS, REASONING_BUDGETS } from "./constants"

export function reasoningTokens(level: ThinkingLevel): number {
  const budget = REASONING_BUDGETS.find((entry) => entry.level === level)
  if (budget instanceof Object) {
    return budget.tokens
  }
  throw new Error(MODEL_DIAGNOSTICS.unknownReasoningLevel)
}
