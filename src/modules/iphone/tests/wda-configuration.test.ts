import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import { IPHONE_CONFIG_CAPABILITIES_SCHEMA } from "#synapse/modules/iphone/adapters/configuration-file"
import { validateIphoneConfiguration } from "#synapse/modules/iphone/internal/configuration"
import { buildIphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import { simulatorWdaConfig } from "./wda-support"

function propagatesPort(): void {
  const config = simulatorWdaConfig("http://localhost:1234", 54321)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, config.capabilities)).toBe(true)
  expect(validateIphoneConfiguration(config, "darwin").kind).toBe("accepted")
  expect(buildIphoneCapabilities(config, "darwin")).toMatchObject({
    "appium:wdaLocalPort": 54321,
    "appium:wdaBindingIP": "127.0.0.1",
    "appium:useNewWDA": true,
  })
}

function rejectsZero(): void {
  const config = simulatorWdaConfig("http://localhost:1234", 0)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, config.capabilities)).toBe(false)
}

function rejectsExceededPort(): void {
  const config = simulatorWdaConfig("http://localhost:1234", 65536)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, config.capabilities)).toBe(false)
}

function rejectsFraction(): void {
  const config = simulatorWdaConfig("http://localhost:1234", 1.5)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, config.capabilities)).toBe(false)
}

function rejectsString(): void {
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { wdaLocalPort: "54321" })).toBe(false)
}

function rejectsNegative(): void {
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { wdaLocalPort: -1 })).toBe(false)
}

function preservesRemote(): void {
  const config = simulatorWdaConfig("http://remote.example:1234", 54321)
  delete config.capabilities
  expect(validateIphoneConfiguration(config, "darwin").kind).toBe("accepted")
  expect(buildIphoneCapabilities(config, "darwin")["appium:wdaBindingIP"]).toBeUndefined()
}

function preservesExplicitWda(): void {
  const config = simulatorWdaConfig("http://localhost:1234", 54321)
  delete config.capabilities
  config.target.wdaUrl = "http://remote.example:2345"
  expect(validateIphoneConfiguration(config, "darwin").kind).toBe("accepted")
  expect(buildIphoneCapabilities(config, "darwin")["appium:wdaBindingIP"]).toBeUndefined()
}

function suite(): void {
  test("valida e propaga porta com binding coerente", propagatesPort)
  test("recusa zero", rejectsZero)
  test("recusa porta excedida", rejectsExceededPort)
  test("recusa fração", rejectsFraction)
  test("recusa string", rejectsString)
  test("recusa negativo", rejectsNegative)
  test("preserva servidor remoto sem precheck local", preservesRemote)
  test("preserva WDA explícito sem precheck local", preservesExplicitWda)
}

describe("configuração endpoint WDA", suite)
