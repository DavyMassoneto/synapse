import {
  type ComputerAction,
  type ComputerActionCode,
  type ComputerActionEffect,
  type ComputerActionResult,
  type ComputerRecommendedAction,
} from "#synapse/modules/computer-use/public/contracts"

export interface ComputerActionEvidence {
  action: ComputerAction["action"]
  ok: boolean
  message: string
  verified?: boolean
  effect?: ComputerActionEffect
  code?: ComputerActionCode
  recommended?: ComputerRecommendedAction
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
  recommended?: ComputerRecommendedAction
}

export type ComputerActionVerdict = ComputerDoneVerdict | ComputerVerifyVerdict | ComputerEscalateVerdict

export interface ComputerJudgedAction {
  result: ComputerActionResult
  verdict: ComputerActionVerdict
}
