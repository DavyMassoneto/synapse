import { setTimeout } from "node:timers/promises"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"

export class SlowSupervisedOutput implements SupervisedShellOutput {
  bytes = 0
  async write(data: Buffer): Promise<void> {
    await setTimeout(100)
    this.bytes += data.length
  }
}
