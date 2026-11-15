import { expect } from "vitest"
import { createSupervisedShell, type SupervisedShellLease } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_BURST_COMPLETION,
  SUPERVISED_BURST_PHASE_SEPARATOR,
  SUPERVISED_BURST_PREPARATION,
  SUPERVISED_BURST_STOP,
  SUPERVISED_TEST_NATIVE_BURST_COMMAND,
} from "./constants"
import { SupervisedTestOutput } from "./output"
import { type SupervisedBurstResolve } from "./types"

export class SupervisedForkBurst {
  private readonly shell = createSupervisedShell()
  private readonly output = new SupervisedTestOutput()
  private lease?: SupervisedShellLease
  async prepare(index: number): Promise<void> {
    const began = performance.now()
    try {
      this.lease = await this.shell.create(
        {
          executable: "/bin/bash",
          arguments: ["-c", SUPERVISED_TEST_NATIVE_BURST_COMMAND],
          cwd: process.cwd(),
          environment: process.env,
        },
        this.output,
      )
    } finally {
      process.stderr.write(
        [index, SUPERVISED_BURST_PREPARATION, performance.now() - began, SUPERVISED_BURST_PHASE_SEPARATOR].join(" "),
      )
    }
  }
  async run(index: number): Promise<void> {
    if (!this.lease) {
      throw new Error(SUPERVISED_BURST_PREPARATION)
    }
    const began = performance.now()
    try {
      this.lease.release()
      await this.output.waitForMarker()
      await new Promise<void>(resolveBurstDelay.bind(undefined, index))
      process.stderr.write(
        [index, SUPERVISED_BURST_STOP, performance.now() - began, SUPERVISED_BURST_PHASE_SEPARATOR].join(" "),
      )
      await this.lease.terminate()
      expect(this.lease.state).toBe("exited")
      expect(await this.lease.completion).toBeGreaterThanOrEqual(0)
    } finally {
      process.stderr.write(
        [index, SUPERVISED_BURST_COMPLETION, performance.now() - began, SUPERVISED_BURST_PHASE_SEPARATOR].join(" "),
      )
    }
  }
  async close(): Promise<void> {
    await this.shell.close()
  }
}

function resolveBurstDelay(index: number, resolve: SupervisedBurstResolve): void {
  setTimeout(resolve, index % 3)
}
