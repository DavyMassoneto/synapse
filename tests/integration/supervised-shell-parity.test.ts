import { createBashTool } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { SupervisedBashOperations } from "#synapse/integration/pi/agent-team/supervised-bash"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_BACKGROUND_TIMEOUT,
  SUPERVISED_TEST_EXIT_TIMEOUT_TITLE,
  SUPERVISED_TEST_NATIVE_PARITY,
  SUPERVISED_TEST_PARITY_COMMAND,
  SUPERVISED_TEST_TIMEOUT_COMMAND,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_TIMEOUT_TITLE,
} from "../fixtures"

async function nativeParity(): Promise<void> {
  const supervisor = createSupervisedShell()
  const native = createBashTool(process.cwd(), { exposeSessionEnvironment: false })
  const owned = createBashTool(process.cwd(), {
    operations: new SupervisedBashOperations(supervisor),
    exposeSessionEnvironment: false,
  })
  try {
    const expected = await native.execute("native", { command: SUPERVISED_TEST_PARITY_COMMAND }, undefined, undefined)
    const actual = await owned.execute("owned", { command: SUPERVISED_TEST_PARITY_COMMAND }, undefined, undefined)
    expect(actual.content).toEqual(expected.content)
    expect(actual).toMatchObject({ structuredContent: { output: "stdout\nstderr\n", exit_code: 7, truncated: false } })
    expect(expected).toMatchObject({
      structuredContent: { output: "stdout\nstderr\n", exit_code: 7, truncated: false },
    })
  } finally {
    await supervisor.close()
  }
}

async function timeoutParity(): Promise<void> {
  const supervisor = createSupervisedShell()
  const native = createBashTool(process.cwd(), { exposeSessionEnvironment: false })
  const owned = createBashTool(process.cwd(), {
    exposeSessionEnvironment: false,
    operations: new SupervisedBashOperations(supervisor),
  })
  try {
    await expect(
      native.execute("native", { command: SUPERVISED_TEST_TIMEOUT_COMMAND, timeout: 0.25 }, undefined, undefined),
    ).rejects.toThrow("entered\n\nCommand timed out after 0.25 seconds")
    await expect(
      owned.execute("owned", { command: SUPERVISED_TEST_TIMEOUT_COMMAND, timeout: 0.25 }, undefined, undefined),
    ).rejects.toThrow("entered\n\nCommand timed out after 0.25 seconds")
  } finally {
    await supervisor.close()
  }
}

async function leaderBeforeDeadline(): Promise<void> {
  const supervisor = createSupervisedShell()
  const native = createBashTool(process.cwd(), { exposeSessionEnvironment: false })
  const owned = createBashTool(process.cwd(), {
    exposeSessionEnvironment: false,
    operations: new SupervisedBashOperations(supervisor),
  })
  try {
    const expected = await native.execute(
      "native",
      { command: SUPERVISED_TEST_BACKGROUND_TIMEOUT, timeout: 0.25 },
      undefined,
      undefined,
    )
    const actual = await owned.execute(
      "owned",
      { command: SUPERVISED_TEST_BACKGROUND_TIMEOUT, timeout: 0.25 },
      undefined,
      undefined,
    )
    expect(actual.content).toEqual(expected.content)
    expect(actual).toMatchObject({ isError: true, structuredContent: { exit_code: 7, output: "", truncated: false } })
  } finally {
    await supervisor.close()
  }
}

test(SUPERVISED_TEST_NATIVE_PARITY, nativeParity, SUPERVISED_TEST_TIMEOUT_MS)

test(SUPERVISED_TEST_TIMEOUT_TITLE, timeoutParity, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_EXIT_TIMEOUT_TITLE, leaderBeforeDeadline, SUPERVISED_TEST_TIMEOUT_MS)
