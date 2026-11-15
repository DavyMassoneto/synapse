import { expect, test } from "vitest"
import { runCompiledNative } from "./compiled-native-runner"
import { SHELL_NATIVE_REAP_BEFORE_PIPE_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_COMPILED_EXEC_CLASSIFICATION } from "./native-fixture-constants"
import { SHELL_TEST_EXEC_NOT_FOUND, SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"

function reapedBeforeExecPipe(): void {
  const output = runCompiledNative(SHELL_COMPILED_EXEC_CLASSIFICATION)
  expect(output[0]).toBe(4)
  expect(output.subarray(3, -1).toString()).toBe(SHELL_TEST_EXEC_NOT_FOUND)
  expect(output[output.length - 1]).toBe(3)
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_REAP_BEFORE_PIPE_TITLE,
  reapedBeforeExecPipe,
  SHELL_NATIVE_TEST_MS,
)
