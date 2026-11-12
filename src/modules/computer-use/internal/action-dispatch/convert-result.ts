import {
  type ComputerAction,
  type ComputerDriverCallResult,
  type ComputerExecutedAction,
} from "#synapse/modules/computer-use/public/contracts"
import { computerJudgeAction } from "../action-verdict"
import { computerDriverEvidence } from "./dispatch-evidence"
import { computerExecutedFromJudgment } from "./dispatch-executed"

export function computerDispatchJudgment(
  action: ComputerAction,
  response: ComputerDriverCallResult,
): ComputerExecutedAction {
  return computerExecutedFromJudgment(computerJudgeAction(computerDriverEvidence(action, response)))
}
