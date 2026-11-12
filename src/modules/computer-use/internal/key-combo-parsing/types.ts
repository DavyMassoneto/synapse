import { type COMPUTER_KEY_MISSING, type COMPUTER_KEY_PARSED } from "./outcomes"

export interface ComputerParsedKey {
  kind: typeof COMPUTER_KEY_PARSED
  key: string
  modifiers: string[]
}

export interface ComputerMissingKey {
  kind: typeof COMPUTER_KEY_MISSING
}

export type ComputerKeyParsingResult = ComputerParsedKey | ComputerMissingKey

export interface ComputerKeyAliases {
  command: string
  control: string
  windows: string
  "⌘": string
  "⌥": string
}
