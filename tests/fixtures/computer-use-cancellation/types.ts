import { type PiComputerToolContext, type PiComputerToolHandler } from "#synapse/integration/pi/computer-use"
import { type CancellationComputer } from "./computer"

export interface ComputerCancellationSut {
  computer: CancellationComputer
  controller: AbortController
  handler: PiComputerToolHandler
  context: PiComputerToolContext
}
