import { expect, test, vi } from "vitest"
import { requireUnixShell } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { requireWindowsShell } from "#synapse/modules/agent-team/adapters/supervised-shell/windows"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SHELL_REQUIREMENT_ADD_TYPE_TITLE,
  SHELL_REQUIREMENT_EXACT_MARKER_TITLE,
  SHELL_REQUIREMENT_EXTRA_LINE_TITLE,
  SHELL_REQUIREMENT_PLATFORM_TITLE,
  SHELL_REQUIREMENT_POWERSHELL_TITLE,
  SHELL_REQUIREMENT_PS_TITLE,
  SHELL_REQUIREMENT_TEST_EXTRA_LINE,
  SHELL_REQUIREMENT_TEST_MARKER,
} from "./constants"
import { ProbeResultScenario } from "./probe-result-support"

async function missingPs(): Promise<void> {
  await expect(requireUnixShell("/nonexistent/synapse-ps")).rejects.toThrow("requer /bin/ps executável")
}
async function missingPowerShell(): Promise<void> {
  await expect(requireWindowsShell("synapse-powershell-not-installed")).rejects.toThrow("powershell.exe")
}
async function unavailableAddType(): Promise<void> {
  await expect(requireWindowsShell(process.execPath)).rejects.toThrow("Add-Type funcional")
}
function unsupportedPlatform(): void {
  const platform = vi.spyOn(process, "platform", "get").mockReturnValue("aix")
  try {
    expect(createSupervisedShell).toThrow("apenas em macOS, Linux e Windows")
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
  expect(result.failure?.message).toContain("Add-Type funcional")
}

test(SHELL_REQUIREMENT_EXACT_MARKER_TITLE, exactMarker)
test(SHELL_REQUIREMENT_EXTRA_LINE_TITLE, rejectsExtraLine)
test(SHELL_REQUIREMENT_PS_TITLE, missingPs)
test(SHELL_REQUIREMENT_POWERSHELL_TITLE, missingPowerShell)
test(SHELL_REQUIREMENT_ADD_TYPE_TITLE, unavailableAddType)
test(SHELL_REQUIREMENT_PLATFORM_TITLE, unsupportedPlatform)
