import { expect, test } from "vitest"
import { runCompiledNative } from "./compiled-native-runner"
import { SHELL_NATIVE_JOIN_KERNEL_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_COMPILED_JOIN_KERNEL } from "./native-fixture-constants"
import { SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"

function kernelRejectsSessionJoin(): void {
  expect(runCompiledNative(SHELL_COMPILED_JOIN_KERNEL).length).toBe(0)
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_JOIN_KERNEL_TITLE,
  kernelRejectsSessionJoin,
  SHELL_NATIVE_TEST_MS,
)
