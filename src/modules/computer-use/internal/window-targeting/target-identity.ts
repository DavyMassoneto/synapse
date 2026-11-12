import { COMPUTER_EXACT_TARGET_SELECTED, COMPUTER_TARGET_SELECTED } from "./outcomes"
import { type ComputerStickyTarget, type ComputerTargetIdentity } from "./types"

export function computerTargetIdentity(target: ComputerStickyTarget): ComputerTargetIdentity {
  if (target.kind === COMPUTER_TARGET_SELECTED) {
    return { kind: COMPUTER_EXACT_TARGET_SELECTED, pid: target.window.pid, windowId: target.window.windowId }
  }
  return target
}
