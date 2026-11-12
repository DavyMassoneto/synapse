import { COMPUTER_BOUNDS_KNOWN, type ComputerWindow } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DRIVER_WINDOW_NAME, COMPUTER_MIN_WINDOW_SIDE, COMPUTER_WINDOW_NAME_SEPARATORS } from "./constants"

export function isComputerNonDriverWindow(window: ComputerWindow): boolean {
  return window.app.trim().toLowerCase().replace(COMPUTER_WINDOW_NAME_SEPARATORS, "") !== COMPUTER_DRIVER_WINDOW_NAME
}

export function isComputerSubstantialWindow(window: ComputerWindow): boolean {
  if (window.bounds.kind === COMPUTER_BOUNDS_KNOWN) {
    const bounds = window.bounds.rectangle
    return bounds.width >= COMPUTER_MIN_WINDOW_SIDE && bounds.height >= COMPUTER_MIN_WINDOW_SIDE && bounds.y >= 0
  }
  return true
}

export function isComputerShellWindow(window: ComputerWindow, names: string[]): boolean {
  const name = `${window.app} ${window.title}`.toLowerCase()
  return names.some((shell) => name.includes(shell))
}
