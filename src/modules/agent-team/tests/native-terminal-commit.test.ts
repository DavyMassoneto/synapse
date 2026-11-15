import { expect, test } from "vitest"
import { runCompiledNative } from "./compiled-native-runner"
import { SHELL_NATIVE_COMMIT_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_COMPILED_TERMINAL_COMMIT } from "./native-fixture-constants"
import { SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"

function esrchCommitsBeforeFailedAck(): void {
  expect(runCompiledNative(SHELL_COMPILED_TERMINAL_COMMIT).length).toBe(0)
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_COMMIT_TITLE,
  esrchCommitsBeforeFailedAck,
  SHELL_NATIVE_TEST_MS,
)
