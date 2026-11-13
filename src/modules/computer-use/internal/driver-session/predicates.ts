import {
  COMPUTER_DRIVER_DISCONNECTED,
  COMPUTER_DRIVER_TIMEOUT,
  type ComputerDriverCallResult,
} from "#synapse/modules/computer-use/public/contracts"

export function hasComputerTransportFailure(result: ComputerDriverCallResult): boolean {
  return result.kind === COMPUTER_DRIVER_TIMEOUT || result.kind === COMPUTER_DRIVER_DISCONNECTED
}
