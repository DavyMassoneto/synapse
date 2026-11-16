import { expect, test, vi } from "vitest"
import { requireWindowsShell } from "#synapse/modules/agent-team/adapters/supervised-shell/windows"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SHELL_REQUIREMENT_ADD_TYPE_TITLE,
  SHELL_REQUIREMENT_EXACT_MARKER_TITLE,
  SHELL_REQUIREMENT_EXTRA_LINE_TITLE,
  SHELL_REQUIREMENT_PLATFORM_TITLE,
  SHELL_REQUIREMENT_POWERSHELL_TITLE,
  SHELL_REQUIREMENT_TEST_EXTRA_LINE,
  SHELL_REQUIREMENT_TEST_MARKER,
} from "./constants"
import {
  SHELL_REQUIREMENT_ADD_TYPE_ERROR,
  SHELL_REQUIREMENT_GETTER,
  SHELL_REQUIREMENT_MISSING_COMMAND,
  SHELL_REQUIREMENT_PLATFORM_PROPERTY,
  SHELL_REQUIREMENT_POWERSHELL,
  SHELL_REQUIREMENT_UNSUPPORTED_ERROR,
  SHELL_REQUIREMENT_UNSUPPORTED_PLATFORM,
} from "./native-scenario-constants"
import { ProbeResultScenario } from "./probe-result-support"

async function missingPowerShell(): Promise<void> {
  await expect(requireWindowsShell(SHELL_REQUIREMENT_MISSING_COMMAND)).rejects.toThrow(SHELL_REQUIREMENT_POWERSHELL)
}
async function unavailableAddType(): Promise<void> {
  await expect(requireWindowsShell(process.execPath)).rejects.toThrow(SHELL_REQUIREMENT_ADD_TYPE_ERROR)
}
function unsupportedPlatform(): void {
  const platform = vi
    .spyOn(process, SHELL_REQUIREMENT_PLATFORM_PROPERTY, SHELL_REQUIREMENT_GETTER)
    .mockReturnValue(SHELL_REQUIREMENT_UNSUPPORTED_PLATFORM)
  try {
    expect(createSupervisedShell).toThrow(SHELL_REQUIREMENT_UNSUPPORTED_ERROR)
  } finally {
    platform.mockRestore()
  }
}

function exactMarker(): void {
  const result = new ProbeResultScenario()
  result.check(SHELL_REQUIREMENT_TEST_MARKER)
  expect(result.accepted).toBe(true)
  expect(result.failure).toBeUndefined()
}
function rejectsExtraLine(): void {
  const result = new ProbeResultScenario()
  result.check(SHELL_REQUIREMENT_TEST_EXTRA_LINE)
  expect(result.accepted).toBe(false)
  expect(result.failure).toBeInstanceOf(Error)
  expect(result.failure?.message).toContain(SHELL_REQUIREMENT_ADD_TYPE_ERROR)
}

test(SHELL_REQUIREMENT_EXACT_MARKER_TITLE, exactMarker)
test(SHELL_REQUIREMENT_EXTRA_LINE_TITLE, rejectsExtraLine)
test(SHELL_REQUIREMENT_POWERSHELL_TITLE, missingPowerShell)
test(SHELL_REQUIREMENT_ADD_TYPE_TITLE, unavailableAddType)
test(SHELL_REQUIREMENT_PLATFORM_TITLE, unsupportedPlatform)
