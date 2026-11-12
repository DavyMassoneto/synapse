import { COMPUTER_DARWIN, type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_ALT_KEY,
  COMPUTER_COMMAND_ALIAS,
  COMPUTER_COMMAND_SYMBOL,
  COMPUTER_CONTROL_ALIAS,
  COMPUTER_DESKTOP_MODIFIERS,
  COMPUTER_KEY_ALIASES,
  COMPUTER_KEY_SEPARATOR,
  COMPUTER_MAC_MODIFIERS,
  COMPUTER_OPTION_KEY,
  COMPUTER_OPTION_SYMBOL,
  COMPUTER_WINDOWS_ALIAS,
} from "./constants"
import { COMPUTER_KEY_MISSING, COMPUTER_KEY_PARSED } from "./outcomes"
import { type ComputerKeyParsingResult } from "./types"

export function computerNormalizeKey(part: string, platform: ComputerPlatform): string {
  switch (part) {
    case COMPUTER_COMMAND_ALIAS:
    case COMPUTER_CONTROL_ALIAS:
    case COMPUTER_WINDOWS_ALIAS:
    case COMPUTER_COMMAND_SYMBOL:
    case COMPUTER_OPTION_SYMBOL:
      return COMPUTER_KEY_ALIASES[part]
    default:
      if (part === COMPUTER_ALT_KEY && platform === COMPUTER_DARWIN) {
        return COMPUTER_OPTION_KEY
      }
      return part
  }
}

export function computerParseKeyCombo(keys: string, platform: ComputerPlatform): ComputerKeyParsingResult {
  const modifiers: string[] = []
  const accepted = platform === COMPUTER_DARWIN ? COMPUTER_MAC_MODIFIERS : COMPUTER_DESKTOP_MODIFIERS
  let key = ""
  for (const raw of keys.split(COMPUTER_KEY_SEPARATOR)) {
    const part = computerNormalizeKey(raw.trim().toLowerCase(), platform)
    if (part) {
      if (accepted.includes(part)) {
        modifiers.push(part)
      } else if (key) {
        return { kind: COMPUTER_KEY_MISSING }
      } else {
        key = part
      }
    }
  }
  if (key) {
    return { kind: COMPUTER_KEY_PARSED, key, modifiers }
  }
  return { kind: COMPUTER_KEY_MISSING }
}
