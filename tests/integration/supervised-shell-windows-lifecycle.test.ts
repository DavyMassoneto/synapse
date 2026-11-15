import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SlowSupervisedOutput,
  SUPERVISED_TEST_EXITED_STATE,
  SUPERVISED_TEST_INPUT_FILLER,
  SUPERVISED_TEST_NODE_EVAL_FLAG,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE,
  SUPERVISED_TEST_WINDOWS_DRAIN_SCRIPT,
  SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE,
  SUPERVISED_TEST_WINDOWS_READY_SCRIPT,
  SupervisedTestOutput,
} from "../fixtures"

async function largeStdinDoesNotBlockStop(): Promise<void> {
  const output = new SupervisedTestOutput()
  const supervisor = createSupervisedShell()
  try {
    const lease = await supervisor.create(
      {
        executable: process.execPath,
        arguments: [SUPERVISED_TEST_NODE_EVAL_FLAG, SUPERVISED_TEST_WINDOWS_READY_SCRIPT],
        cwd: process.cwd(),
        environment: process.env,
        input: SUPERVISED_TEST_INPUT_FILLER.repeat(600000),
      },
      output,
    )
    lease.release()
    await output.waitForMarker()
    await lease.terminate()
    expect(lease.state).toBe(SUPERVISED_TEST_EXITED_STATE)
  } finally {
    await supervisor.close()
  }
}

async function foregroundProducerFence(): Promise<void> {
  const output = new SlowSupervisedOutput()
  const supervisor = createSupervisedShell()
  try {
    const lease = await supervisor.create(
      {
        executable: process.execPath,
        arguments: [SUPERVISED_TEST_NODE_EVAL_FLAG, SUPERVISED_TEST_WINDOWS_DRAIN_SCRIPT],
        cwd: process.cwd(),
        environment: process.env,
      },
      output,
    )
    lease.release()
    expect(await lease.completion).toBe(0)
    expect(output.bytes).toBe(200000)
  } finally {
    await supervisor.close()
  }
}

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE,
  largeStdinDoesNotBlockStop,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE,
  foregroundProducerFence,
  SUPERVISED_TEST_TIMEOUT_MS,
)
