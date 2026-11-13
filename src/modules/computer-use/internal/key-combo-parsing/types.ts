export interface ComputerParsedKey {
  kind: "key-parsed"
  key: string
  modifiers: string[]
}

export interface ComputerMissingKey {
  kind: "key-missing"
}

export type ComputerKeyParsingResult = ComputerParsedKey | ComputerMissingKey

export interface ComputerKeyAliases {
  command: string
  control: string
  windows: string
  "⌘": string
  "⌥": string
}
