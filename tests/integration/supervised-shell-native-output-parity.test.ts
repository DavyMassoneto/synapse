import { createLocalBashOperations } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  CausalOutputSink,
  SUPERVISED_TEST_NATIVE_OUTPUT_PARITY_TITLE,
  SUPERVISED_TEST_OUTPUT_BACKGROUND_COMMAND,
  SUPERVISED_TEST_OUTPUT_FOREGROUND_COMMAND,
  SUPERVISED_TEST_SHELL_COMMAND_FLAG,
  SUPERVISED_TEST_SHELL_EXECUTABLE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
} from "../fixtures"

async function slowOutputParity(background: boolean): Promise<void> {
  const command = background ? SUPERVISED_TEST_OUTPUT_BACKGROUND_COMMAND : SUPERVISED_TEST_OUTPUT_FOREGROUND_COMMAND
  const native = createLocalBashOperations()
  const expected = new CausalOutputSink()
  const result = await native.exec(command, process.cwd(), { onData: expected.write.bind(expected) })
  const shell = createSupervisedShell()
  const actual = new CausalOutputSink()
  try {
    const lease = await shell.create(
      {
        executable: SUPERVISED_TEST_SHELL_EXECUTABLE,
        arguments: [SUPERVISED_TEST_SHELL_COMMAND_FLAG, command],
        cwd: process.cwd(),
        environment: process.env,
      },
      actual,
    )
    lease.release()
    expect(await lease.completion).toBe(result.exitCode)
    expect(actual.bytes).toBe(200000)
    expect(actual.bytes).toBe(await expected.accepted())
  } finally {
    await shell.close()
  }
}

test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS).each([false, true])(
  SUPERVISED_TEST_NATIVE_OUTPUT_PARITY_TITLE,
  slowOutputParity,
  SUPERVISED_TEST_TIMEOUT_MS,
)
