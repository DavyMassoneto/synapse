import { COMPUTER_BOUNDS_KNOWN, type ComputerWindow } from "#synapse/modules/computer-use/public/contracts"

export function computerCopyWindow(window: ComputerWindow): ComputerWindow {
  if (window.bounds.kind === COMPUTER_BOUNDS_KNOWN) {
    return { ...window, bounds: { kind: COMPUTER_BOUNDS_KNOWN, rectangle: { ...window.bounds.rectangle } } }
  }
  return { ...window, bounds: { ...window.bounds } }
}
