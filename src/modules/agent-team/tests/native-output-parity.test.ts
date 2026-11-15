import { createLocalBashOperations } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import { CausalOutputSink } from "./causal-output-sink"
import { SHELL_NATIVE_OUTPUT_PARITY_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"

async function slowOutputParity(background: boolean): Promise<void> {
  const command = background ? "head -c 200000 /dev/zero; sleep 1 &" : "head -c 200000 /dev/zero"
  const native = createLocalBashOperations()
  const expected = new CausalOutputSink()
  const result = await native.exec(command, process.cwd(), { onData: expected.write.bind(expected) })
  const shell = createSupervisedShell()
  const actual = new CausalOutputSink()
  try {
    const lease = await shell.create(
      { executable: "/bin/bash", arguments: ["-c", command], cwd: process.cwd(), environment: process.env },
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

test.skipIf(process.platform === "win32").each([false, true])(
  SHELL_NATIVE_OUTPUT_PARITY_TITLE,
  slowOutputParity,
  SHELL_NATIVE_TEST_MS,
)
