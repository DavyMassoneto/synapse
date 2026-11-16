import { expect, test } from "vitest"
import { runCompiledNative } from "./compiled-native-runner"
import { SHELL_NATIVE_CONTROL_DEADLINE_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_COMPILED_CONTROL_DEADLINE } from "./native-fixture-constants"
import { SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"

function localDeadlineCannotExtend(): void {
  expect(runCompiledNative(SHELL_COMPILED_CONTROL_DEADLINE).length).toBe(0)
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_CONTROL_DEADLINE_TITLE,
  localDeadlineCannotExtend,
  SHELL_NATIVE_TEST_MS,
)
