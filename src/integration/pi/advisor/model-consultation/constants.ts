import { type PiThinkingBudgets } from "./types"

export const INVALID_REFERENCE = "Referência de modelo advisor inválida."

export const CAPABILITIES_CHANGED = "As capacidades do modelo advisor mudaram durante a consulta."

export const EMPTY_RESPONSE = "O advisor não retornou texto."

export const PROVIDER_FAILED = "O provedor do advisor falhou sem informar o erro."

export const PI_THINKING_BUDGETS: PiThinkingBudgets = {
  off: 0,
  minimal: 1_024,
  low: 2_048,
  medium: 8_192,
  high: 16_384,
  xhigh: 16_384,
  max: 16_384,
}
