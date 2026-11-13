import {
  COMPUTER_CANCELLED,
  COMPUTER_EXECUTED,
  COMPUTER_FAILED,
  COMPUTER_REFUSED,
  type ComputerExecuteResult,
} from "#synapse/modules"

export function isComputerToolError(result: ComputerExecuteResult): boolean {
  return (
    result.kind === COMPUTER_EXECUTED &&
    (result.result.kind === COMPUTER_REFUSED ||
      result.result.kind === COMPUTER_FAILED ||
      result.result.kind === COMPUTER_CANCELLED)
  )
}
