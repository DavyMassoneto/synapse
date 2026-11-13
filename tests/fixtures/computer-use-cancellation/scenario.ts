import { PiComputerToolHandler } from "#synapse/integration"
import { CancellationComputer } from "./computer"
import { COMPUTER_CANCELLATION_SESSION } from "./constants"
import { type ComputerCancellationSut } from "./types"

export function computerCancellationSut(): ComputerCancellationSut {
  const computer = new CancellationComputer()
  return {
    computer,
    controller: new AbortController(),
    handler: new PiComputerToolHandler(computer),
    context: { sessionManager: { getSessionId: computerCancellationSession } },
  }
}

function computerCancellationSession(): string {
  return COMPUTER_CANCELLATION_SESSION
}
