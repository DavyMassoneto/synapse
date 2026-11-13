import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_SESSION_NATIVE_FOCUS_TOOL } from "./constants"

export function computerSessionCallArguments(
  name: string,
  argumentsValue: ComputerDriverArguments,
  sessionId: string,
): ComputerDriverArguments {
  const scopedArguments = { ...argumentsValue }
  if (name !== COMPUTER_SESSION_NATIVE_FOCUS_TOOL) {
    scopedArguments.session = sessionId
  }
  return scopedArguments
}
