import { type StdioOptions, spawn } from "node:child_process"
import { writeSync } from "node:fs"
import {
  SHELL_NATIVE_FIXTURE_COMMAND_ARGUMENT,
  SHELL_NATIVE_FIXTURE_DIRECTORY_ARGUMENT,
  SHELL_NATIVE_FIXTURE_EXECUTABLE_ARGUMENT,
} from "./constants"
import { type NativeFixtureExitCode } from "./types"

function runNativeFixture(): void {
  const executable = process.argv[SHELL_NATIVE_FIXTURE_EXECUTABLE_ARGUMENT]
  const directory = process.argv[SHELL_NATIVE_FIXTURE_DIRECTORY_ARGUMENT]
  const command = process.argv[SHELL_NATIVE_FIXTURE_COMMAND_ARGUMENT]
  if (!executable || !directory || !command) {
    process.exitCode = 94
  } else {
    const stdio: StdioOptions = ["ignore", "ignore", "ignore", 3, 4, "ignore", 2, 5]
    const child = spawn(executable, [directory, "/bin/bash", "-c", command], { stdio })
    writeSync(8, `${child.pid}\n`)
    child.on("close", nativeFixtureClosed)
  }
}
runNativeFixture()

function nativeFixtureClosed(code: NativeFixtureExitCode): void {
  if (typeof code === "number") {
    process.exitCode = code
  } else {
    process.exitCode = 94
  }
}
