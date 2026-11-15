import { expect, test, vi } from "vitest"
import { requireUnixShell, requireWindowsShell } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SHELL_REQUIREMENT_ADD_TYPE_TITLE,
  SHELL_REQUIREMENT_PLATFORM_TITLE,
  SHELL_REQUIREMENT_POWERSHELL_TITLE,
  SHELL_REQUIREMENT_PS_TITLE,
} from "./constants"

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

test(SHELL_REQUIREMENT_PS_TITLE, missingPs)
test(SHELL_REQUIREMENT_POWERSHELL_TITLE, missingPowerShell)
test(SHELL_REQUIREMENT_ADD_TYPE_TITLE, unavailableAddType)
test(SHELL_REQUIREMENT_PLATFORM_TITLE, unsupportedPlatform)
