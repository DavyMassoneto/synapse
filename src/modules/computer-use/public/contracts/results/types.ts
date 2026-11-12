import { type ComputerAction } from "../actions"
import {
  type COMPUTER_COMPLETED,
  type COMPUTER_EFFECT_CONFIRMED,
  type COMPUTER_EFFECT_SUSPECTED_NOOP,
  type COMPUTER_EFFECT_UNVERIFIABLE,
  type COMPUTER_FAILED,
  type COMPUTER_OUTCOME_UNKNOWN,
  type COMPUTER_REFUSED,
  type COMPUTER_UNCONFIRMED,
} from "./constants"

export interface ComputerCompletedResult {
  kind: typeof COMPUTER_COMPLETED
  action: ComputerAction["action"]
  message: string
}

export interface ComputerUnconfirmedResult {
  kind: typeof COMPUTER_UNCONFIRMED
  action: ComputerAction["action"]
  message: string
}

export interface ComputerRefusedResult {
  kind: typeof COMPUTER_REFUSED
  action: ComputerAction["action"]
  message: string
}

export interface ComputerUnknownResult {
  kind: typeof COMPUTER_OUTCOME_UNKNOWN
  action: ComputerAction["action"]
  message: string
  retryAllowed: false
}

export interface ComputerFailedResult {
  kind: typeof COMPUTER_FAILED
  action: ComputerAction["action"]
  message: string
}

export type ComputerActionResult =
  | ComputerCompletedResult
  | ComputerUnconfirmedResult
  | ComputerRefusedResult
  | ComputerUnknownResult
  | ComputerFailedResult

export type ComputerActionEffect =
  | typeof COMPUTER_EFFECT_CONFIRMED
  | typeof COMPUTER_EFFECT_UNVERIFIABLE
  | typeof COMPUTER_EFFECT_SUSPECTED_NOOP

export type ComputerActionCode = "type_text_incomplete" | "timeout_outcome_unknown" | "transport_outcome_unknown"

export type ComputerVerdictDecision = "done" | "verify-fresh-state" | "escalate" | "stop"

export type ComputerRecommendedAction = "set_value" | "px" | "foreground"
