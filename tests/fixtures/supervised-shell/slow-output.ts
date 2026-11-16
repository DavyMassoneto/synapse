import { setTimeout } from "node:timers/promises"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_TEST_SLOW_OUTPUT_MS } from "./constants"

export class SlowSupervisedOutput implements SupervisedShellOutput {
  bytes = 0
  async write(data: Buffer): Promise<void> {
    await setTimeout(SUPERVISED_TEST_SLOW_OUTPUT_MS)
    this.bytes += data.length
  }
}
