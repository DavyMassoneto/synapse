import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { SHELL_NATIVE_JOIN_FAILURE_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"

function failedJoinDoesNotRelease(): void {
  const directory = mkdtempSync(join(tmpdir(), "native-join-failure-"))
  const executable = join(directory, "join-test")
  const source = join(__dirname, "../adapters/supervised-shell/unix/native")
  try {
    execFileSync("cc", [
      "-D_POSIX_C_SOURCE=200809L",
      "-I",
      source,
      join(__dirname, "native-join-failure.c"),
      join(source, "child.c"),
      join(source, "control.c"),
      join(source, "clock.c"),
      join(source, "wire.c"),
      join(source, "reservation.c"),
      "-o",
      executable,
    ])
    expect(execFileSync(executable).length).toBe(0)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test.skipIf(process.platform === "win32")(
  SHELL_NATIVE_JOIN_FAILURE_TITLE,
  failedJoinDoesNotRelease,
  SHELL_NATIVE_TEST_MS,
)
