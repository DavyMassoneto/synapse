import {
  COMPUTER_FOREGROUND,
  COMPUTER_KEY,
  COMPUTER_TYPE,
  type ComputerAction,
  type ComputerPlatform,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_KEY_SEPARATOR, computerNormalizeKey } from "../key-combo-parsing"
import {
  COMPUTER_BLOCKED_COMBOS,
  COMPUTER_BLOCKED_TEXT_PATTERNS,
  COMPUTER_BRING_TO_FRONT_PROPERTY,
  COMPUTER_INVALID_FOREGROUND_MESSAGE,
  COMPUTER_SAFETY_ALLOWED,
  COMPUTER_SAFETY_ALT_KEY,
  COMPUTER_SAFETY_OPTION_KEY,
  COMPUTER_SAFETY_REFUSED,
  COMPUTER_SAFETY_WIN_ALIASES,
  COMPUTER_SAFETY_WIN_KEY,
  COMPUTER_UNSAFE_KEY_MESSAGE,
  COMPUTER_UNSAFE_TEXT_MESSAGE,
} from "./constants"
import { type ComputerSafetyResult } from "./types"

export function computerCheckActionSafety(action: ComputerAction, platform: ComputerPlatform): ComputerSafetyResult {
  const text = computerCheckTypedText(action)
  if (text.kind === COMPUTER_SAFETY_REFUSED) {
    return text
  }
  const keys = computerCheckSystemShortcut(action, platform)
  if (keys.kind === COMPUTER_SAFETY_REFUSED) {
    return keys
  }
  return computerCheckForegroundRequest(action)
}

function computerCheckTypedText(action: ComputerAction): ComputerSafetyResult {
  if (action.action === COMPUTER_TYPE && COMPUTER_BLOCKED_TEXT_PATTERNS.some((pattern) => pattern.test(action.text))) {
    return { kind: COMPUTER_SAFETY_REFUSED, message: COMPUTER_UNSAFE_TEXT_MESSAGE }
  }
  return { kind: COMPUTER_SAFETY_ALLOWED }
}

function computerCheckSystemShortcut(action: ComputerAction, platform: ComputerPlatform): ComputerSafetyResult {
  if (action.action === COMPUTER_KEY) {
    const keys = new Set<string>()
    for (const part of action.keys.split(COMPUTER_KEY_SEPARATOR)) {
      let key = computerNormalizeKey(part.trim().toLowerCase(), platform)
      if (key === COMPUTER_SAFETY_ALT_KEY) {
        key = COMPUTER_SAFETY_OPTION_KEY
      }
      keys.add(COMPUTER_SAFETY_WIN_ALIASES.includes(key) ? COMPUTER_SAFETY_WIN_KEY : key)
    }
    for (const blocked of COMPUTER_BLOCKED_COMBOS) {
      if (blocked.every((key) => keys.has(key))) {
        return { kind: COMPUTER_SAFETY_REFUSED, message: COMPUTER_UNSAFE_KEY_MESSAGE }
      }
    }
  }
  return { kind: COMPUTER_SAFETY_ALLOWED }
}

function computerCheckForegroundRequest(action: ComputerAction): ComputerSafetyResult {
  if (
    COMPUTER_BRING_TO_FRONT_PROPERTY in action &&
    action.bringToFront &&
    action.deliveryMode !== COMPUTER_FOREGROUND
  ) {
    return { kind: COMPUTER_SAFETY_REFUSED, message: COMPUTER_INVALID_FOREGROUND_MESSAGE }
  }
  return { kind: COMPUTER_SAFETY_ALLOWED }
}
