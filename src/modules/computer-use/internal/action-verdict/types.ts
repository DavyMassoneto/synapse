import {
  type ComputerAction,
  type ComputerActionCode,
  type ComputerActionEffect,
  type ComputerActionResult,
} from "#synapse/modules/computer-use/public/contracts"
import {
  type COMPUTER_NEXT_COORDINATE,
  type COMPUTER_NEXT_FOREGROUND,
  type COMPUTER_NEXT_SET_VALUE,
  type COMPUTER_VERDICT_DONE,
  type COMPUTER_VERDICT_ESCALATE,
  type COMPUTER_VERDICT_VERIFY,
} from "./outcomes"

export type ComputerEscalation =
  | typeof COMPUTER_NEXT_SET_VALUE
  | typeof COMPUTER_NEXT_COORDINATE
  | typeof COMPUTER_NEXT_FOREGROUND

export interface ComputerActionEvidence {
  action: ComputerAction["action"]
  ok: boolean
  message: string
  verified?: boolean
  effect?: ComputerActionEffect
  code?: ComputerActionCode
  recommended?: ComputerEscalation
  deliveredChars?: number
  requestedChars?: number
}

export interface ComputerDoneVerdict {
  kind: typeof COMPUTER_VERDICT_DONE
}

export interface ComputerVerifyVerdict {
  kind: typeof COMPUTER_VERDICT_VERIFY
  message: string
  retryAllowed: false
}

export interface ComputerEscalateVerdict {
  kind: typeof COMPUTER_VERDICT_ESCALATE
  message: string
  recommended?: ComputerEscalation
}

export type ComputerActionVerdict = ComputerDoneVerdict | ComputerVerifyVerdict | ComputerEscalateVerdict

export interface ComputerJudgedAction {
  result: ComputerActionResult
  verdict: ComputerActionVerdict
}
