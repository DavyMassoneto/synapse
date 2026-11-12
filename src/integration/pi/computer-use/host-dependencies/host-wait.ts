import { setTimeout } from "node:timers/promises"
import { type ComputerWaitPort } from "#synapse/modules"

export class PiComputerHostWait implements ComputerWaitPort {
  async wait(milliseconds: number): Promise<void> {
    await setTimeout(milliseconds)
  }
}
