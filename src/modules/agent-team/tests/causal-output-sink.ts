import { setTimeout } from "node:timers/promises"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SHELL_RUNTIME_SINK_DELAY_MS } from "./constants"

export class CausalOutputSink implements SupervisedShellOutput {
  bytes = 0
  writes = 0
  async write(data: Buffer): Promise<void> {
    this.writes++
    await setTimeout(SHELL_RUNTIME_SINK_DELAY_MS)
    this.bytes += data.length
  }
}
