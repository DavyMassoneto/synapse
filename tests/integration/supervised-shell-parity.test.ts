import { createBashTool } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { SupervisedBashOperations } from "#synapse/integration/pi/agent-team/supervised-bash"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_BACKGROUND_TIMEOUT,
  SUPERVISED_TEST_EXIT_TIMEOUT_TITLE,
  SUPERVISED_TEST_NATIVE_PARITY,
  SUPERVISED_TEST_PARITY_COMMAND,
  SUPERVISED_TEST_PARITY_EXIT_STATUS,
  SUPERVISED_TEST_PARITY_OUTPUTS,
  SUPERVISED_TEST_PARITY_TIMEOUT_MESSAGE,
  SUPERVISED_TEST_PARITY_TIMEOUT_SECONDS,
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
    for (const result of [expected, actual]) {
      expect(result).toMatchObject({ isError: true, structuredContent: { exit_code: 7, truncated: false } })
      const structured = result.structuredContent
      expect(structured).toHaveProperty("output")
      if (structured && typeof structured === "object" && "output" in structured) {
        expect(SUPERVISED_TEST_PARITY_OUTPUTS).toContain(structured.output)
        expect(result.content).toEqual([
          { type: "text", text: `${structured.output}\n\n${SUPERVISED_TEST_PARITY_EXIT_STATUS}` },
        ])
      }
    }
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
      native.execute(
        "native",
        { command: SUPERVISED_TEST_TIMEOUT_COMMAND, timeout: SUPERVISED_TEST_PARITY_TIMEOUT_SECONDS },
        undefined,
        undefined,
      ),
    ).rejects.toThrow(SUPERVISED_TEST_PARITY_TIMEOUT_MESSAGE)
    await expect(
      owned.execute(
        "owned",
        { command: SUPERVISED_TEST_TIMEOUT_COMMAND, timeout: SUPERVISED_TEST_PARITY_TIMEOUT_SECONDS },
        undefined,
        undefined,
      ),
    ).rejects.toThrow(SUPERVISED_TEST_PARITY_TIMEOUT_MESSAGE)
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
      { command: SUPERVISED_TEST_BACKGROUND_TIMEOUT, timeout: SUPERVISED_TEST_PARITY_TIMEOUT_SECONDS },
      undefined,
      undefined,
    )
    const actual = await owned.execute(
      "owned",
      { command: SUPERVISED_TEST_BACKGROUND_TIMEOUT, timeout: SUPERVISED_TEST_PARITY_TIMEOUT_SECONDS },
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
