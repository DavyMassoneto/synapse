import {
  COMPUTER_COMPLETED,
  COMPUTER_EXECUTED,
  type ComputerAction,
  type ComputerExecutedAction,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_VERDICT_DONE } from "../action-verdict"

export function computerConfirmedExecution(action: ComputerAction, message: string): ComputerExecutedAction {
  return {
    kind: COMPUTER_EXECUTED,
    result: { kind: COMPUTER_COMPLETED, action: action.action, message },
    verdict: { decision: COMPUTER_VERDICT_DONE, retryAllowed: false },
  }
}
