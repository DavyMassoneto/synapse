import {
  COMPUTER_EXECUTED,
  type ComputerAction,
  type ComputerExecutedAction,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_VERDICT_DONE, COMPUTER_VERDICT_ESCALATE, type ComputerJudgedAction } from "../action-verdict"
import { COMPUTER_DISPATCH_REFUSED_VERDICT } from "./constants"
import { type ComputerDispatchFailureKind } from "./types"

export function computerDispatchFailure(
  action: ComputerAction,
  message: string,
  kind: ComputerDispatchFailureKind,
): ComputerExecutedAction {
  return {
    kind: COMPUTER_EXECUTED,
    result: { kind, action: action.action, message },
    verdict: { decision: COMPUTER_DISPATCH_REFUSED_VERDICT, message, retryAllowed: false },
  }
}

export function computerExecutedFromJudgment(judged: ComputerJudgedAction): ComputerExecutedAction {
  const verdict = judged.verdict
  const result: ComputerExecutedAction = {
    kind: COMPUTER_EXECUTED,
    result: judged.result,
    verdict: { decision: verdict.kind, retryAllowed: false },
  }
  if (verdict.kind !== COMPUTER_VERDICT_DONE) {
    result.verdict.message = verdict.message
  }
  if (verdict.kind === COMPUTER_VERDICT_ESCALATE && verdict.recommended) {
    result.verdict.recommended = verdict.recommended
  }
  return result
}
