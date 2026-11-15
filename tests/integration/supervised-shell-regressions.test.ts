import { createBashTool } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { SupervisedBashOperations } from "#synapse/integration/pi/agent-team/supervised-bash"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  FailedStopShell,
  SlowSupervisedOutput,
  SUPERVISED_TEST_CANCEL_COMMAND,
  SUPERVISED_TEST_CANCEL_CREATE_TITLE,
  SUPERVISED_TEST_CANCEL_OUTPUT,
  SUPERVISED_TEST_DEADLINE_FAILURE_TITLE,
  SUPERVISED_TEST_DRAIN_COMMAND,
  SUPERVISED_TEST_DRAIN_TITLE,
  SUPERVISED_TEST_FORBIDDEN_SCRIPT,
  SUPERVISED_TEST_INVALID_TIMEOUT_ERROR,
  SUPERVISED_TEST_INVALID_TIMEOUT_TITLE,
  SUPERVISED_TEST_KILL_ERROR,
  SUPERVISED_TEST_NODE_EVAL_FLAG,
  SUPERVISED_TEST_SHELL_COMMAND_FLAG,
  SUPERVISED_TEST_SHELL_EXECUTABLE,
  SUPERVISED_TEST_SIGNAL_COMMAND,
  SUPERVISED_TEST_SIGNAL_ID,
  SUPERVISED_TEST_SIGNAL_TITLE,
  SUPERVISED_TEST_STOP_CREATE_TITLE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SupervisedTestOutput,
} from "../fixtures"

async function foregroundDrain(): Promise<void> {
  const shell = createSupervisedShell()
  const output = new SlowSupervisedOutput()
  try {
    const lease = await shell.create(
      {
        executable: SUPERVISED_TEST_SHELL_EXECUTABLE,
        arguments: [SUPERVISED_TEST_SHELL_COMMAND_FLAG, SUPERVISED_TEST_DRAIN_COMMAND],
        cwd: process.cwd(),
        environment: process.env,
      },
      output,
    )
    lease.release()
    expect(await lease.completion).toBe(0)
    expect(output.bytes).toBe(200000)
  } finally {
    await shell.close()
  }
}

async function cancelCreation(): Promise<void> {
  const shell = createSupervisedShell()
  const output: Buffer[] = []
  const controller = new AbortController()
  const operations = new SupervisedBashOperations(shell)
  try {
    const executing = operations.exec(SUPERVISED_TEST_CANCEL_COMMAND, process.cwd(), {
      env: process.env,
      signal: controller.signal,
      onData: output.push.bind(output),
    })
    controller.abort()
    await expect(executing).rejects.toThrow()
    expect(Buffer.concat(output).toString()).not.toContain(SUPERVISED_TEST_CANCEL_OUTPUT)
  } finally {
    await shell.close()
  }
}

async function stopCreation(): Promise<void> {
  const shell = createSupervisedShell()
  const creating = shell.create(
    {
      executable: process.execPath,
      arguments: [SUPERVISED_TEST_NODE_EVAL_FLAG, SUPERVISED_TEST_FORBIDDEN_SCRIPT],
      cwd: process.cwd(),
      environment: process.env,
    },
    new SupervisedTestOutput(),
  )
  const stopped = shell.stop()
  await expect(creating).rejects.toThrow()
  await stopped
  await shell.close()
}

async function signalParity(): Promise<void> {
  const shell = createSupervisedShell()
  try {
    const tool = createBashTool(process.cwd(), {
      exposeSessionEnvironment: false,
      operations: new SupervisedBashOperations(shell),
    })
    const result = await tool.execute(
      SUPERVISED_TEST_SIGNAL_ID,
      { command: SUPERVISED_TEST_SIGNAL_COMMAND },
      undefined,
      undefined,
    )
    expect(result).toMatchObject({ structuredContent: { exit_code: 129 } })
  } finally {
    await shell.close()
  }
}

async function invalidTimeout(): Promise<void> {
  const shell = createSupervisedShell()
  try {
    const executing = new SupervisedBashOperations(shell).exec(SUPERVISED_TEST_CANCEL_COMMAND, process.cwd(), {
      timeout: 0,
      env: process.env,
      onData: Buffer.byteLength,
    })
    await expect(executing).rejects.toThrow(SUPERVISED_TEST_INVALID_TIMEOUT_ERROR)
  } finally {
    await shell.close()
  }
}

async function deadlineFailureWinsPendingCompletion(): Promise<void> {
  const shell = new FailedStopShell()
  const operations = new SupervisedBashOperations(shell)
  await expect(
    operations.exec(SUPERVISED_TEST_CANCEL_COMMAND, process.cwd(), {
      timeout: 0.01,
      env: process.env,
      onData: Buffer.byteLength,
    }),
  ).rejects.toThrow(SUPERVISED_TEST_KILL_ERROR)
  expect(shell.calls).toBe(2)
}

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_DRAIN_TITLE,
  foregroundDrain,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test(SUPERVISED_TEST_CANCEL_CREATE_TITLE, cancelCreation, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_STOP_CREATE_TITLE, stopCreation, SUPERVISED_TEST_TIMEOUT_MS)
test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_SIGNAL_TITLE,
  signalParity,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test(SUPERVISED_TEST_INVALID_TIMEOUT_TITLE, invalidTimeout, SUPERVISED_TEST_TIMEOUT_MS)

test(SUPERVISED_TEST_DEADLINE_FAILURE_TITLE, deadlineFailureWinsPendingCompletion, SUPERVISED_TEST_TIMEOUT_MS)
