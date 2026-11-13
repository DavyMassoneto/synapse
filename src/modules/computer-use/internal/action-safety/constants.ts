export const COMPUTER_BRING_TO_FRONT_PROPERTY = "bringToFront"

export const COMPUTER_SAFETY_ALLOWED = "safety-allowed"

export const COMPUTER_SAFETY_REFUSED = "safety-refused"

export const COMPUTER_BLOCKED_COMBOS = [
  ["cmd", "shift", "backspace"],
  ["cmd", "option", "backspace"],
  ["cmd", "ctrl", "q"],
  ["cmd", "shift", "q"],
  ["cmd", "option", "shift", "q"],
  ["win", "l"],
  ["ctrl", "option", "delete"],
  ["ctrl", "option", "del"],
  ["option", "f4"],
]

export const COMPUTER_BLOCKED_TEXT_PATTERNS = [
  /curl\s+[^|]*\|\s*bash/i,
  /curl\s+[^|]*\|\s*sh/i,
  /wget\s+[^|]*\|\s*bash/i,
  /\bsudo\s+rm\s+-[rf]/i,
  /\brm\s+-rf\s+\/\s*$/i,
  /:\s*\(\)\s*\{\s*:\|:\s*&\s*\}/,
]

export const COMPUTER_UNSAFE_TEXT_MESSAGE = "Texto recusado: comandos de shell perigosos não podem ser digitados."

export const COMPUTER_UNSAFE_KEY_MESSAGE = "Combinação recusada: atalhos destrutivos do sistema são bloqueados."

export const COMPUTER_INVALID_FOREGROUND_MESSAGE = "Trazer à frente exige deliveryMode='foreground'."

export const COMPUTER_SAFETY_WIN_ALIASES = ["super", "meta"]

export const COMPUTER_SAFETY_WIN_KEY = "win"
