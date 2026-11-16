import { expect, test } from "vitest"
import { runCompiledNative } from "./compiled-native-runner"
import { SHELL_NATIVE_CLOCK_FAILURE_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_COMPILED_CLOCK_FAILURE } from "./native-fixture-constants"
import { SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"

function clockFailureIsTerminal(): void {
  expect(runCompiledNative(SHELL_COMPILED_CLOCK_FAILURE).length).toBe(0)
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_CLOCK_FAILURE_TITLE,
  clockFailureIsTerminal,
  SHELL_NATIVE_TEST_MS,
)
