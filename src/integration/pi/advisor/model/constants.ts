import { type ReasoningBudget } from "./types"

export const MODEL_DIAGNOSTICS = {
  invalidReference: "Referência de modelo advisor inválida.",
  capabilitiesChanged: "As capacidades do modelo advisor mudaram durante a consulta.",
  emptyResponse: "O advisor não retornou texto.",
}

export const REASONING_BUDGETS: ReasoningBudget[] = [
  { level: "minimal", tokens: 1_024 },
  { level: "low", tokens: 2_048 },
  { level: "medium", tokens: 8_192 },
  { level: "high", tokens: 16_384 },
  { level: "xhigh", tokens: 16_384 },
  { level: "max", tokens: 16_384 },
]
