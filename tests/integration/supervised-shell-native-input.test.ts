import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_NATIVE_INPUT_TITLE,
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
        executable: "/bin/bash",
        arguments: ["-c", "printf WINDOWS_READY; sleep 20"],
        cwd: process.cwd(),
        environment: process.env,
        input: "x".repeat(600000),
      },
      output,
    )
    lease.release()
    await output.waitForMarker()
    await lease.terminate()
    expect(lease.state).toBe("exited")
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
