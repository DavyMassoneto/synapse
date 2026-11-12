import {
  type ComputerApplication,
  type ComputerPlatform,
  type ComputerWindow,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_INPUT_TARGET_MISMATCH } from "./constants"
import { computerCopyWindow } from "./copy-window"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  COMPUTER_TARGET_ABSENT,
  COMPUTER_TARGET_REJECTED,
  COMPUTER_TARGET_SELECTED,
} from "./outcomes"
import { computerSelectWindow } from "./select-window"
import {
  type ComputerInputTarget,
  type ComputerStickyTarget,
  type ComputerTargetRequest,
  type ComputerTargetSelection,
} from "./types"

export class ComputerStickyWindowTarget {
  private target: ComputerStickyTarget = { kind: COMPUTER_TARGET_ABSENT }

  select(
    windows: ComputerWindow[],
    applications: ComputerApplication[],
    request: ComputerTargetRequest,
    platform: ComputerPlatform,
  ): ComputerTargetSelection {
    const selection = computerSelectWindow(windows, applications, request, platform)
    if (selection.kind === COMPUTER_TARGET_SELECTED || selection.kind === COMPUTER_EXACT_TARGET_SELECTED) {
      this.target = selection
    } else {
      this.clear()
    }
    return selection
  }

  current(): ComputerStickyTarget {
    if (this.target.kind === COMPUTER_TARGET_SELECTED) {
      return { kind: COMPUTER_TARGET_SELECTED, window: computerCopyWindow(this.target.window) }
    }
    if (this.target.kind === COMPUTER_EXACT_TARGET_SELECTED) {
      return { ...this.target }
    }
    return { kind: COMPUTER_TARGET_ABSENT }
  }

  inputTarget(requestedApp?: string): ComputerInputTarget {
    if (this.target.kind === COMPUTER_TARGET_SELECTED && requestedApp) {
      const current = this.target.window.app.trim().toLowerCase()
      const wanted = requestedApp.trim().toLowerCase()
      if (current && wanted && !current.includes(wanted) && !wanted.includes(current)) {
        return { kind: COMPUTER_TARGET_REJECTED, message: COMPUTER_INPUT_TARGET_MISMATCH }
      }
    }
    return this.current()
  }

  clear(): void {
    this.target = { kind: COMPUTER_TARGET_ABSENT }
  }
}
