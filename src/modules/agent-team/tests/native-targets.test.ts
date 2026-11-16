import { expect, test, vi } from "vitest"
import {
  provisionUnixLauncher,
  UNIX_LAUNCHER_ASSETS,
  UNIX_LAUNCHER_PLATFORM_ASSETS,
} from "#synapse/modules/agent-team/adapters/supervised-shell/unix/provision"
import {
  SHELL_NATIVE_ARCHITECTURE_PROPERTY,
  SHELL_NATIVE_PLATFORM_PROPERTY,
  SHELL_NATIVE_PROPERTY_GETTER,
  SHELL_NATIVE_TARGET_CASES,
  SHELL_NATIVE_TARGET_REJECT_TITLE,
  SHELL_NATIVE_TARGET_REJECTIONS,
  SHELL_NATIVE_TARGET_TITLE,
} from "./native-target-constants"
import { type NativeTargetCase, type NativeTargetRejection } from "./native-test-types"

function acceptsTarget(scenario: NativeTargetCase): void {
  expect(UNIX_LAUNCHER_PLATFORM_ASSETS[scenario.platform][scenario.architecture]).toBe(
    UNIX_LAUNCHER_ASSETS[scenario.asset],
  )
}

async function rejectsTarget(scenario: NativeTargetRejection): Promise<void> {
  const platform = vi
    .spyOn(process, SHELL_NATIVE_PLATFORM_PROPERTY, SHELL_NATIVE_PROPERTY_GETTER)
    .mockReturnValue(scenario.platform)
  const architecture = vi
    .spyOn(process, SHELL_NATIVE_ARCHITECTURE_PROPERTY, SHELL_NATIVE_PROPERTY_GETTER)
    .mockReturnValue(scenario.architecture)
  try {
    await expect(provisionUnixLauncher()).rejects.toThrow(scenario.message)
  } finally {
    platform.mockRestore()
    architecture.mockRestore()
  }
}

test.each(SHELL_NATIVE_TARGET_CASES)(SHELL_NATIVE_TARGET_TITLE, acceptsTarget)
test.each(SHELL_NATIVE_TARGET_REJECTIONS)(SHELL_NATIVE_TARGET_REJECT_TITLE, rejectsTarget)
