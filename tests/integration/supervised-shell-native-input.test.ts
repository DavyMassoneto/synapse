import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_EXITED_STATE,
  SUPERVISED_TEST_INPUT_FILLER,
  SUPERVISED_TEST_NATIVE_INPUT_COMMAND,
  SUPERVISED_TEST_NATIVE_INPUT_TITLE,
  SUPERVISED_TEST_SHELL_COMMAND_FLAG,
  SUPERVISED_TEST_SHELL_EXECUTABLE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SupervisedTestOutput,
} from "../fixtures"

async function nonReadingInput(): Promise<void> {
  const shell = createSupervisedShell()
  const output = new SupervisedTestOutput()
  try {
    const lease = await shell.create(
      {
        executable: SUPERVISED_TEST_SHELL_EXECUTABLE,
        arguments: [SUPERVISED_TEST_SHELL_COMMAND_FLAG, SUPERVISED_TEST_NATIVE_INPUT_COMMAND],
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
    expect(await lease.completion).toBeGreaterThan(0)
  } finally {
    await shell.close()
  }
}

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_NATIVE_INPUT_TITLE,
  nonReadingInput,
  SUPERVISED_TEST_TIMEOUT_MS,
)
