import { type ComputerAction } from "../actions"

export interface ComputerCancelledResult {
  kind: "cancelled"
  action: ComputerAction["action"]
  message: string
}

export interface ComputerCompletedResult {
  kind: "completed"
  action: ComputerAction["action"]
  message: string
}

export interface ComputerUnconfirmedResult {
  kind: "unconfirmed"
  action: ComputerAction["action"]
  message: string
}

export interface ComputerRefusedResult {
  kind: "refused"
  action: ComputerAction["action"]
  message: string
}

export interface ComputerUnknownResult {
  kind: "outcome-unknown"
  action: ComputerAction["action"]
  message: string
  retryAllowed: false
}

export interface ComputerFailedResult {
  kind: "failed"
  action: ComputerAction["action"]
  message: string
}

export type ComputerActionResult =
  | ComputerCancelledResult
  | ComputerCompletedResult
  | ComputerUnconfirmedResult
  | ComputerRefusedResult
  | ComputerUnknownResult
  | ComputerFailedResult

export type ComputerActionEffect = "confirmed" | "unverifiable" | "suspected_noop"

export type ComputerActionCode = "type_text_incomplete" | "timeout_outcome_unknown" | "transport_outcome_unknown"

export type ComputerVerdictDecision = "done" | "verify-fresh-state" | "escalate" | "stop"

export type ComputerRecommendedAction = "set_value" | "px" | "foreground"
