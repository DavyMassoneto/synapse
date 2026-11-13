import {
  COMPUTER_EFFECT_CONFIRMED,
  COMPUTER_EFFECT_SUSPECTED_NOOP,
  COMPUTER_FAILED,
  COMPUTER_OUTCOME_UNKNOWN,
  COMPUTER_UNCONFIRMED,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_CODE_OUTCOME_UNCERTAINTY,
  COMPUTER_EFFECT_POLICIES,
  COMPUTER_ESCALATE_MESSAGE,
  COMPUTER_ESCALATE_SET_VALUE_MESSAGE,
  COMPUTER_VERIFY_TRANSPORT_MESSAGE,
  COMPUTER_VERIFY_UNKNOWN_MESSAGE,
} from "./constants"
import { COMPUTER_NEXT_SET_VALUE, COMPUTER_VERDICT_ESCALATE, COMPUTER_VERDICT_VERIFY } from "./outcomes"
import { hasComputerNoDeliveredCharacters } from "./predicates"
import { type ComputerActionEvidence, type ComputerActionVerdict, type ComputerJudgedAction } from "./types"

function computerEscalationVerdict(evidence: ComputerActionEvidence): ComputerActionVerdict {
  if (hasComputerNoDeliveredCharacters(evidence)) {
    return {
      kind: COMPUTER_VERDICT_ESCALATE,
      recommended: COMPUTER_NEXT_SET_VALUE,
      message: COMPUTER_ESCALATE_SET_VALUE_MESSAGE,
    }
  }
  if (evidence.recommended) {
    return { kind: COMPUTER_VERDICT_ESCALATE, recommended: evidence.recommended, message: COMPUTER_ESCALATE_MESSAGE }
  }
  return { kind: COMPUTER_VERDICT_ESCALATE, message: COMPUTER_ESCALATE_MESSAGE }
}

export function computerJudgeAction(evidence: ComputerActionEvidence): ComputerJudgedAction {
  const action = evidence.action
  const message = evidence.message
  if (evidence.code && COMPUTER_CODE_OUTCOME_UNCERTAINTY[evidence.code]) {
    return {
      result: { kind: COMPUTER_OUTCOME_UNKNOWN, action, message, retryAllowed: false },
      verdict: { kind: COMPUTER_VERDICT_VERIFY, message: COMPUTER_VERIFY_UNKNOWN_MESSAGE, retryAllowed: false },
    }
  }
  let effect = evidence.effect
  if (evidence.verified === true) {
    effect = COMPUTER_EFFECT_CONFIRMED
  }
  if (effect && effect !== COMPUTER_EFFECT_SUSPECTED_NOOP) {
    const policy = COMPUTER_EFFECT_POLICIES[effect]
    return { result: { kind: policy.resultKind, action, message }, verdict: policy.verdict }
  }
  if (evidence.effect === COMPUTER_EFFECT_SUSPECTED_NOOP || !evidence.ok || evidence.code) {
    return { result: { kind: COMPUTER_FAILED, action, message }, verdict: computerEscalationVerdict(evidence) }
  }
  return {
    result: { kind: COMPUTER_UNCONFIRMED, action, message },
    verdict: { kind: COMPUTER_VERDICT_VERIFY, message: COMPUTER_VERIFY_TRANSPORT_MESSAGE, retryAllowed: false },
  }
}
