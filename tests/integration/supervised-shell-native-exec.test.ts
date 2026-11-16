import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_MISSING_EXECUTABLE,
  SUPERVISED_TEST_MISSING_EXECUTABLE_ERROR,
  SUPERVISED_TEST_NATIVE_EXEC_FAILURE_TITLE,
  SUPERVISED_TEST_QUARANTINED_STATE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SupervisedTestOutput,
} from "../fixtures"

async function nativeExecFailure(): Promise<void> {
  const shell = createSupervisedShell()
  try {
    const lease = await shell.create(
      { executable: SUPERVISED_TEST_MISSING_EXECUTABLE, arguments: [], cwd: process.cwd(), environment: process.env },
      new SupervisedTestOutput(),
    )
    lease.release()
    await expect(lease.completion).rejects.toThrow(SUPERVISED_TEST_MISSING_EXECUTABLE_ERROR)
    await lease.terminate()
    expect(lease.state).toBe(SUPERVISED_TEST_QUARANTINED_STATE)
  } finally {
    await shell.close()
  }
}

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_NATIVE_EXEC_FAILURE_TITLE,
  nativeExecFailure,
  SUPERVISED_TEST_TIMEOUT_MS,
)
