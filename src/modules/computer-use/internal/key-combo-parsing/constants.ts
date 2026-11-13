import { type ComputerKeyAliases } from "./types"

export const COMPUTER_KEY_SEPARATOR = /[+-]/

export const COMPUTER_MAC_MODIFIERS = ["cmd", "shift", "option", "ctrl", "fn"]

export const COMPUTER_DESKTOP_MODIFIERS = ["shift", "alt", "ctrl", "fn", "win", "super", "meta"]

export const COMPUTER_KEY_ALIASES: ComputerKeyAliases = {
  command: "cmd",
  control: "ctrl",
  windows: "win",
  "⌘": "cmd",
  "⌥": "option",
}

export const COMPUTER_COMMAND_ALIAS = "command"

export const COMPUTER_CONTROL_ALIAS = "control"

export const COMPUTER_WINDOWS_ALIAS = "windows"

export const COMPUTER_COMMAND_SYMBOL = "⌘"

export const COMPUTER_OPTION_SYMBOL = "⌥"

export const COMPUTER_ALT_KEY = "alt"

export const COMPUTER_OPTION_KEY = "option"
