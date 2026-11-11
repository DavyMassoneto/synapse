import { type Failure } from "#synapse/modules/advisor/public/contracts"

export interface PromptReady {
  kind: "ready"
  text: string
}

export type PreparedPrompt = PromptReady | Failure

export interface BudgetAvailable {
  kind: "available"
  characters: number
}

export interface BudgetInsufficient {
  kind: "insufficient"
}

export type PromptBudget = BudgetAvailable | BudgetInsufficient
