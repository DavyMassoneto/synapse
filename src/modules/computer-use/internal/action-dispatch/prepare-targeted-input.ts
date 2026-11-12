import { type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  type ComputerStickyTarget,
  type ComputerTargetIdentity,
  computerTargetIdentity,
} from "../window-targeting"
import { COMPUTER_DISPATCH_DESKTOP_SCOPE, COMPUTER_DISPATCH_NO_TARGET } from "./constants"
import { computerPrepareInput } from "./prepare-input"
import { type ComputerDispatchPreparedInput, type ComputerInputAction } from "./types"

export function computerPrepareTargetedInput(
  action: ComputerInputAction,
  target: ComputerStickyTarget,
  platform: ComputerPlatform,
): ComputerDispatchPreparedInput {
  const prepared = computerPrepareInput(action, platform)
  if (prepared.arguments.scope !== COMPUTER_DISPATCH_DESKTOP_SCOPE) {
    computerAssignTargetWindow(prepared, computerTargetIdentity(target))
  }
  return prepared
}

function computerAssignTargetWindow(prepared: ComputerDispatchPreparedInput, identity: ComputerTargetIdentity): void {
  if (identity.kind !== COMPUTER_EXACT_TARGET_SELECTED) {
    throw new Error(COMPUTER_DISPATCH_NO_TARGET)
  }
  prepared.arguments.pid = identity.pid
  prepared.arguments.window_id = identity.windowId
}
