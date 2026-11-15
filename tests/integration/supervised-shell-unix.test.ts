import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_BACKGROUND,
  SUPERVISED_TEST_BACKGROUND_TITLE,
  SUPERVISED_TEST_COMMAND,
  SUPERVISED_TEST_CONFIGURED_OUTPUT,
  SUPERVISED_TEST_ENV,
  SUPERVISED_TEST_EXITED_STATE,
  SUPERVISED_TEST_NO_ACK,
  SUPERVISED_TEST_RELEASED_STATE,
  SUPERVISED_TEST_SHELL_COMMAND_FLAG,
  SUPERVISED_TEST_SHELL_EXECUTABLE,
  SUPERVISED_TEST_STDERR_OUTPUT,
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
        executable: SUPERVISED_TEST_SHELL_EXECUTABLE,
        arguments: [SUPERVISED_TEST_SHELL_COMMAND_FLAG, SUPERVISED_TEST_COMMAND],
        cwd: process.cwd(),
        environment: SUPERVISED_TEST_ENV,
      },
      output,
    )
    lease.release()
    expect(await lease.completion).toBe(7)
    expect(output.text()).toContain(SUPERVISED_TEST_CONFIGURED_OUTPUT)
    expect(output.text()).toContain(SUPERVISED_TEST_STDERR_OUTPUT)
  } finally {
    await supervisor.close()
  }
}

async function noAckNeverExecutes(): Promise<void> {
  const supervisor = createSupervisedShell()
  const output = new SupervisedTestOutput()
  const lease = await supervisor.create(
    {
      executable: SUPERVISED_TEST_SHELL_EXECUTABLE,
      arguments: [SUPERVISED_TEST_SHELL_COMMAND_FLAG, SUPERVISED_TEST_NO_ACK],
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
        executable: SUPERVISED_TEST_SHELL_EXECUTABLE,
        arguments: [SUPERVISED_TEST_SHELL_COMMAND_FLAG, SUPERVISED_TEST_BACKGROUND],
        cwd: process.cwd(),
        environment: SUPERVISED_TEST_ENV,
      },
      output,
    )
    lease.release()
    expect(await lease.completion).toBe(0)
    expect(lease.state).toBe(SUPERVISED_TEST_RELEASED_STATE)
    await supervisor.close()
    expect(lease.state).toBe(SUPERVISED_TEST_EXITED_STATE)
  } finally {
    await supervisor.close()
  }
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
