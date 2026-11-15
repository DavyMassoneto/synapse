import { expect, test, vi } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_BACKGROUND,
  SUPERVISED_TEST_BACKGROUND_TITLE,
  SUPERVISED_TEST_COMMAND,
  SUPERVISED_TEST_ENV,
  SUPERVISED_TEST_KILL_ERROR,
  SUPERVISED_TEST_KILL_FAILURE_TITLE,
  SUPERVISED_TEST_NO_ACK,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_UNIX_SUITE_FIRST,
  SUPERVISED_TEST_UNIX_SUITE_SECOND,
  SUPERVISED_TEST_WINDOWS,
  SupervisedTestOutput,
} from "../fixtures"

async function originalArgumentsAndOutput(): Promise<void> {
  const supervisor = createSupervisedShell()
  const output = new SupervisedTestOutput()
  try {
    const lease = await supervisor.create(
      {
        executable: "/bin/bash",
        arguments: ["-c", SUPERVISED_TEST_COMMAND],
        cwd: process.cwd(),
        environment: SUPERVISED_TEST_ENV,
      },
      output,
    )
    lease.release()
    expect(await lease.completion).toBe(7)
    expect(output.text()).toContain("configured")
    expect(output.text()).toContain("stderr")
  } finally {
    await supervisor.close()
  }
}

async function noAckNeverExecutes(): Promise<void> {
  const supervisor = createSupervisedShell()
  const output = new SupervisedTestOutput()
  const lease = await supervisor.create(
    {
      executable: "/bin/bash",
      arguments: ["-c", SUPERVISED_TEST_NO_ACK],
      cwd: process.cwd(),
      environment: SUPERVISED_TEST_ENV,
    },
    output,
  )
  await supervisor.close()
  expect(await lease.completion).toBe(137)
  expect(output.text()).toBe("")
}

async function leaderExitBackground(): Promise<void> {
  const supervisor = createSupervisedShell()
  const output = new SupervisedTestOutput()
  try {
    const lease = await supervisor.create(
      {
        executable: "/bin/bash",
        arguments: ["-c", SUPERVISED_TEST_BACKGROUND],
        cwd: process.cwd(),
        environment: SUPERVISED_TEST_ENV,
      },
      output,
    )
    lease.release()
    expect(await lease.completion).toBe(0)
    expect(lease.state).toBe("released")
    await supervisor.close()
    expect(lease.state).toBe("exited")
  } finally {
    await supervisor.close()
  }
}

async function killFailureQuarantines(): Promise<void> {
  const supervisor = createSupervisedShell()
  const lease = await supervisor.create(
    {
      executable: "/bin/bash",
      arguments: ["-c", SUPERVISED_TEST_NO_ACK],
      cwd: process.cwd(),
      environment: SUPERVISED_TEST_ENV,
    },
    new SupervisedTestOutput(),
  )
  const kill = process.kill
  const mocked = vi.spyOn(process, "kill").mockImplementation(failKill)
  try {
    await expect(lease.terminate()).rejects.toThrow(SUPERVISED_TEST_KILL_ERROR)
    await expect(lease.terminate()).rejects.toThrow(SUPERVISED_TEST_KILL_ERROR)
    expect(lease.state).toBe("quarantined")
    expect(mocked).toHaveBeenCalledTimes(1)
  } finally {
    const call = mocked.mock.calls[0]
    mocked.mockRestore()
    if (call) {
      kill(call[0], call[1])
    }
    await expect(lease.completion).rejects.toThrow(SUPERVISED_TEST_KILL_ERROR)
    await expect(supervisor.close()).rejects.toThrow()
  }
}

function failKill(): never {
  throw new Error(SUPERVISED_TEST_KILL_ERROR)
}

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_UNIX_SUITE_FIRST,
  originalArgumentsAndOutput,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_UNIX_SUITE_SECOND,
  noAckNeverExecutes,
  SUPERVISED_TEST_TIMEOUT_MS,
)

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_BACKGROUND_TITLE,
  leaderExitBackground,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_KILL_FAILURE_TITLE,
  killFailureQuarantines,
  SUPERVISED_TEST_TIMEOUT_MS,
)
