import { type ComputerDoneVerdict, type ComputerVerifyVerdict } from "../types"

export type ComputerPolicyResultKind = "completed" | "unconfirmed"

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
  window_id_not_found: boolean
  window_owner_pid_mismatch: boolean
}
