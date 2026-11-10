import { type ReasoningBudgets } from "./types"

export const MODEL_DIAGNOSTICS = {
  invalidReference: "Referência de modelo advisor inválida.",
  capabilitiesChanged: "As capacidades do modelo advisor mudaram durante a consulta.",
  emptyResponse: "O advisor não retornou texto.",
}

export const REASONING_BUDGETS: ReasoningBudgets = {
  off: 0,
  minimal: 1_024,
  low: 2_048,
  medium: 8_192,
  high: 16_384,
  xhigh: 16_384,
  max: 16_384,
}
