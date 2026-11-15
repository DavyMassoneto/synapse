import { setTimeout } from "node:timers/promises"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SHELL_RUNTIME_SINK_DELAY_MS } from "./constants"

export class CausalOutputSink implements SupervisedShellOutput {
  bytes = 0
  writes = 0
  private chain = Promise.resolve()
  write(data: Buffer): Promise<void> {
    this.writes++
    this.chain = this.chain.then(this.accept.bind(this, data))
    return this.chain
  }
  private async accept(data: Buffer): Promise<void> {
    await setTimeout(SHELL_RUNTIME_SINK_DELAY_MS)
    this.bytes += data.length
  }
  async accepted(): Promise<number> {
    await this.chain
    return this.bytes
  }
}
