import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { SHELL_NATIVE_REAP_BEFORE_PIPE_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"

function reapedBeforeExecPipe(): void {
  const directory = mkdtempSync(join(tmpdir(), "native-exec-order-"))
  const executable = join(directory, "classification")
  const source = join(__dirname, "../adapters/supervised-shell/unix/native")
  try {
    execFileSync("cc", [
      "-D_POSIX_C_SOURCE=200809L",
      "-I",
      source,
      join(__dirname, "native-exec-classification.c"),
      join(source, "child.c"),
      join(source, "control.c"),
      join(source, "clock.c"),
      join(source, "wire.c"),
      "-o",
      executable,
    ])
    const output = execFileSync(executable)
    expect(output[0]).toBe(4)
    expect(output.subarray(3, -1).toString()).toBe("No such file or directory")
    expect(output[output.length - 1]).toBe(3)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test.skipIf(process.platform === "win32")(
  SHELL_NATIVE_REAP_BEFORE_PIPE_TITLE,
  reapedBeforeExecPipe,
  SHELL_NATIVE_TEST_MS,
)
