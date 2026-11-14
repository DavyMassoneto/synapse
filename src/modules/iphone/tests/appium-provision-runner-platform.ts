import { vi } from "vitest"
import * as scenario from "./appium-provision-runner-platform-constants"

export function mockProvisionWindows(): void {
  vi.stubGlobal("process", { ...process, platform: "win32" })
}

export function mockProvisionPosix(): void {
  vi.stubGlobal("process", { ...process, platform: "darwin" })
}

export function denyProvisionKill(): never {
  throw new Error(scenario.IPHONE_PROVISION_PLATFORM_DENIED_KILL)
}
