import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { SHELL_NATIVE_CONTROL_DEADLINE_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"

function localDeadlineCannotExtend(): void {
  const directory = mkdtempSync(join(tmpdir(), "native-deadline-"))
  const executable = join(directory, "deadline-test")
  const source = join(__dirname, "../adapters/supervised-shell/unix/native")
  try {
    execFileSync("cc", [
      "-D_POSIX_C_SOURCE=200809L",
      "-I",
      source,
      join(__dirname, "native-control-deadline.c"),
      join(source, "control.c"),
      join(source, "clock.c"),
      "-o",
      executable,
    ])
    expect(execFileSync(executable).length).toBe(0)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test.skipIf(process.platform === "win32")(
  SHELL_NATIVE_CONTROL_DEADLINE_TITLE,
  localDeadlineCannotExtend,
  SHELL_NATIVE_TEST_MS,
)
