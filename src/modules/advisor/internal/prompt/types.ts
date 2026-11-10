import { type Failure, type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"

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

export interface FixedMessage {
  kind: "fixed"
  text: string
}

export interface ResizableMessage {
  kind: "resizable"
  message: TranscriptMessage
}

export type PreparedMessage = FixedMessage | ResizableMessage

export interface TranscriptFits {
  kind: "fits"
  text: string
}

export interface TranscriptOverflow {
  kind: "overflow"
  blocks: string[]
}

export type FittedTranscript = TranscriptFits | TranscriptOverflow
