import { describe, expect, test } from "vitest"
import { IphoneWebDriverError } from "#synapse/modules/iphone/adapters/webdriver-http"
import { isUnsupportedIphoneOperation } from "#synapse/modules/iphone/internal/device-actions"
import { checkIphoneHostSupport } from "#synapse/modules/iphone/internal/host-support"

function refusesMacDiscovery(): void {
  expect(
    checkIphoneHostSupport("darwin", { kind: "device", udid: "", deviceName: "iPhone", wdaInstalled: false }),
  ).toMatchObject({ kind: "refused", message: expect.stringContaining("udid") })
}

function acceptsUnsupported(): void {
  expect(isUnsupportedIphoneOperation(new IphoneWebDriverError("unsupported operation", "não suportado"))).toBe(true)
}

function refusesUncertain(): void {
  expect(isUnsupportedIphoneOperation(new IphoneWebDriverError("timeout", "incerto"))).toBe(false)
}

function suite(): void {
  test("recusa aparelho sem udid no macOS", refusesMacDiscovery)
  test("reconhece comando não suportado", acceptsUnsupported)
  test("não autoriza repetição após timeout", refusesUncertain)
}

describe("adaptadores iPhone", suite)
