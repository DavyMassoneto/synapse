import { setTimeout as delay } from "node:timers/promises"
import { expect } from "vitest"
import { createSupervisedShell, type SupervisedShellLease } from "#synapse/modules/agent-team/public/supervised-shell"
import { BurstTiming } from "./burst-timing"
import {
  SUPERVISED_BURST_COMPLETION,
  SUPERVISED_BURST_DELAY_SLOTS,
  SUPERVISED_BURST_PREPARATION,
  SUPERVISED_BURST_STOP,
  SUPERVISED_TEST_EXITED_STATE,
  SUPERVISED_TEST_NATIVE_BURST_COMMAND,
  SUPERVISED_TEST_SHELL_COMMAND_FLAG,
  SUPERVISED_TEST_SHELL_EXECUTABLE,
} from "./constants"
import { SupervisedTestOutput } from "./output"

export class SupervisedForkBurst {
  private readonly shell = createSupervisedShell()
  private readonly output = new SupervisedTestOutput()
  private lease?: SupervisedShellLease
  async prepare(index: number): Promise<void> {
    const timing = new BurstTiming(index)
    try {
      this.lease = await this.shell.create(
        {
          executable: SUPERVISED_TEST_SHELL_EXECUTABLE,
          arguments: [SUPERVISED_TEST_SHELL_COMMAND_FLAG, SUPERVISED_TEST_NATIVE_BURST_COMMAND],
          cwd: process.cwd(),
          environment: process.env,
        },
        this.output,
      )
    } finally {
      timing.record(SUPERVISED_BURST_PREPARATION)
    }
  }
  async run(index: number): Promise<void> {
    if (!this.lease) {
      throw new Error(SUPERVISED_BURST_PREPARATION)
    }
    const timing = new BurstTiming(index)
    try {
      this.lease.release()
      await this.output.waitForMarker()
      await delay(index % SUPERVISED_BURST_DELAY_SLOTS)
      timing.record(SUPERVISED_BURST_STOP)
      await this.lease.terminate()
      expect(this.lease.state).toBe(SUPERVISED_TEST_EXITED_STATE)
      expect(await this.lease.completion).toBeGreaterThanOrEqual(0)
    } finally {
      timing.record(SUPERVISED_BURST_COMPLETION)
    }
  }
  readonly close = this.shell.close.bind(this.shell)
}
