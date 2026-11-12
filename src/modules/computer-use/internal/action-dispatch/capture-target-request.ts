import { type ComputerCaptureAction } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_INVALID_EXACT_TARGET,
  COMPUTER_TARGET_APP,
  COMPUTER_TARGET_EXACT,
  COMPUTER_TARGET_IMPLICIT,
  type ComputerTargetRequest,
} from "../window-targeting"
import { COMPUTER_DISPATCH_PID_PROPERTY, COMPUTER_DISPATCH_WINDOW_PROPERTY } from "./constants"

export function computerCaptureTargetRequest(action: ComputerCaptureAction): ComputerTargetRequest {
  if (COMPUTER_DISPATCH_PID_PROPERTY in action || COMPUTER_DISPATCH_WINDOW_PROPERTY in action) {
    if (COMPUTER_DISPATCH_PID_PROPERTY in action && COMPUTER_DISPATCH_WINDOW_PROPERTY in action) {
      return { kind: COMPUTER_TARGET_EXACT, pid: action.pid, windowId: action.windowId }
    }
    throw new Error(COMPUTER_INVALID_EXACT_TARGET)
  }
  if (action.app) {
    return { kind: COMPUTER_TARGET_APP, app: action.app }
  }
  return { kind: COMPUTER_TARGET_IMPLICIT }
}
