import { type COMPUTER_COMPLETED, type COMPUTER_UNCONFIRMED } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerDoneVerdict, type ComputerVerifyVerdict } from "../types"

export type ComputerPolicyResultKind = typeof COMPUTER_COMPLETED | typeof COMPUTER_UNCONFIRMED

export type ComputerPolicyVerdict = ComputerDoneVerdict | ComputerVerifyVerdict

export interface ComputerVerdictPolicy {
  resultKind: ComputerPolicyResultKind
  verdict: ComputerPolicyVerdict
}

export interface ComputerEffectPolicies {
  confirmed: ComputerVerdictPolicy
  unverifiable: ComputerVerdictPolicy
}

export interface ComputerCodePolicies {
  type_text_incomplete: boolean
  timeout_outcome_unknown: boolean
  transport_outcome_unknown: boolean
}
