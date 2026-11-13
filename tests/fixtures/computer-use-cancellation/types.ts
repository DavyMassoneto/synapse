import { type PiComputerToolContext, type PiComputerToolHandler } from "#synapse/integration"
import { type CancellationComputer } from "./computer"

export interface ComputerCancellationSut {
  computer: CancellationComputer
  controller: AbortController
  handler: PiComputerToolHandler
  context: PiComputerToolContext
}
