import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_NATIVE_BURST_COMMAND,
  SUPERVISED_TEST_NATIVE_BURST_TITLE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  type SupervisedBurstResolve,
  SupervisedTestOutput,
} from "../fixtures"

async function forkBurstTrial(index: number): Promise<void> {
  const shell = createSupervisedShell()
  const output = new SupervisedTestOutput()
  try {
    const lease = await shell.create(
      {
        executable: "/bin/bash",
        arguments: ["-c", SUPERVISED_TEST_NATIVE_BURST_COMMAND],
        cwd: process.cwd(),
        environment: process.env,
      },
      output,
    )
    lease.release()
    await output.waitForMarker()
    await new Promise<void>(resolveBurstDelay.bind(undefined, index))
    await lease.terminate()
    expect(lease.state).toBe("exited")
    expect(await lease.completion).toBeGreaterThanOrEqual(0)
  } finally {
    await shell.close()
  }
}
function resolveBurstDelay(index: number, resolve: SupervisedBurstResolve): void {
  setTimeout(resolve, index % 3)
}
async function thirtyForkBursts(): Promise<void> {
  const trials: Promise<void>[] = []
  for (let trial = 0; trial < 30; trial++) {
    trials.push(forkBurstTrial(trial))
  }
  await Promise.all(trials)
}

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_NATIVE_BURST_TITLE,
  thirtyForkBursts,
  SUPERVISED_TEST_TIMEOUT_MS,
)
