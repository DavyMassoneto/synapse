import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { SHELL_NATIVE_CLOCK_FAILURE_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"

function clockFailureIsTerminal(): void {
  const directory = mkdtempSync(join(tmpdir(), "native-clock-failure-"))
  const executable = join(directory, "join-test")
  const source = join(__dirname, "../adapters/supervised-shell/unix/native")
  try {
    execFileSync("cc", [
      "-D_POSIX_C_SOURCE=200809L",
      "-I",
      source,
      join(__dirname, "native-clock-failure.c"),
      "-o",
      executable,
    ])
    expect(execFileSync(executable).length).toBe(0)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test.skipIf(process.platform !== "darwin")(
  SHELL_NATIVE_CLOCK_FAILURE_TITLE,
  clockFailureIsTerminal,
  SHELL_NATIVE_TEST_MS,
)
