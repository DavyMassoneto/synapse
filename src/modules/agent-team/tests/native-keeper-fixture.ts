import { spawn } from "node:child_process"
import { writeSync } from "node:fs"
import {
  SHELL_NATIVE_FIXTURE_COMMAND_ARGUMENT,
  SHELL_NATIVE_FIXTURE_DIRECTORY_ARGUMENT,
  SHELL_NATIVE_FIXTURE_EXECUTABLE_ARGUMENT,
} from "./constants"
import {
  SHELL_FIXTURE_FAILURE_EXIT,
  SHELL_FIXTURE_IDENTITY_FD,
  SHELL_FIXTURE_PID_TERMINATOR,
  SHELL_FIXTURE_STDIO,
  SHELL_TEST_BASH,
  SHELL_TEST_BASH_COMMAND_FLAG,
  SHELL_TEST_EVENT_CLOSE,
} from "./native-fixture-constants"
import { type NativeFixtureExitCode } from "./types"

function runNativeFixture(): void {
  const executable = process.argv[SHELL_NATIVE_FIXTURE_EXECUTABLE_ARGUMENT]
  const directory = process.argv[SHELL_NATIVE_FIXTURE_DIRECTORY_ARGUMENT]
  const command = process.argv[SHELL_NATIVE_FIXTURE_COMMAND_ARGUMENT]
  if (!executable || !directory || !command) {
    process.exitCode = SHELL_FIXTURE_FAILURE_EXIT
  } else {
    const child = spawn(executable, [directory, SHELL_TEST_BASH, SHELL_TEST_BASH_COMMAND_FLAG, command], {
      stdio: SHELL_FIXTURE_STDIO,
    })
    writeSync(SHELL_FIXTURE_IDENTITY_FD, `${child.pid}${SHELL_FIXTURE_PID_TERMINATOR}`)
    child.on(SHELL_TEST_EVENT_CLOSE, nativeFixtureClosed)
  }
}
runNativeFixture()

function nativeFixtureClosed(code: NativeFixtureExitCode): void {
  if (typeof code === "number") {
    process.exitCode = code
  } else {
    process.exitCode = SHELL_FIXTURE_FAILURE_EXIT
  }
}
