import {
  COMPUTER_DRIVER_RESPONSE,
  type ComputerDriverCallResult,
  type ComputerDriverEnvelope,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerStickyWindowTarget } from "../window-targeting"

export function computerRequireEnvelope(
  response: ComputerDriverCallResult,
  target: ComputerStickyWindowTarget,
): ComputerDriverEnvelope {
  if (response.kind !== COMPUTER_DRIVER_RESPONSE || response.envelope.isError) {
    target.clear()
    throw new Error(computerDriverFailureMessage(response))
  }
  return response.envelope
}

function computerDriverFailureMessage(response: ComputerDriverCallResult): string {
  if (response.kind === COMPUTER_DRIVER_RESPONSE) {
    return response.envelope.message
  }
  return response.message
}
