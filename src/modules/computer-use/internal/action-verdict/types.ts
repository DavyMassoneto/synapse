import {
  type ComputerAction,
  type ComputerActionCode,
  type ComputerActionEffect,
  type ComputerActionResult,
} from "#synapse/modules/computer-use/public/contracts"

export type ComputerEscalation = "set_value" | "px" | "foreground"

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
  kind: "done"
}

export interface ComputerVerifyVerdict {
  kind: "verify-fresh-state"
  message: string
  retryAllowed: false
}

export interface ComputerEscalateVerdict {
  kind: "escalate"
  message: string
  recommended?: ComputerEscalation
}

export type ComputerActionVerdict = ComputerDoneVerdict | ComputerVerifyVerdict | ComputerEscalateVerdict

export interface ComputerJudgedAction {
  result: ComputerActionResult
  verdict: ComputerActionVerdict
}
