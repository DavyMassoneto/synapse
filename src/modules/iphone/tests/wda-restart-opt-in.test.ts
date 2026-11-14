import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import { IPHONE_CONFIG_CAPABILITIES_SCHEMA } from "#synapse/modules/iphone/adapters/configuration-file"
import { validateIphoneConfiguration } from "#synapse/modules/iphone/internal/configuration"
import { buildIphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import { IPHONE_WDA_RESTART_OPT_IN_REQUIRED } from "#synapse/modules/iphone/internal/wda-endpoint"
import { IPHONE_ACCEPTED, IPHONE_DEVICE, IPHONE_REFUSED } from "#synapse/modules/iphone/public/contracts"
import { TestIphoneHttpServer } from "./doubles"
import { WdaFactoryScenario } from "./wda-factory-scenario"
import {
  IPHONE_TEST_WDA_RESTART_DEVICE,
  IPHONE_TEST_WDA_RESTART_DEVICE_NAME,
  IPHONE_TEST_WDA_RESTART_DEVICE_UDID,
  IPHONE_TEST_WDA_RESTART_EXTERNAL,
  IPHONE_TEST_WDA_RESTART_EXTERNAL_URL,
  IPHONE_TEST_WDA_RESTART_FALSE,
  IPHONE_TEST_WDA_RESTART_IPV6,
  IPHONE_TEST_WDA_RESTART_IPV6_URL,
  IPHONE_TEST_WDA_RESTART_LOCAL_URL,
  IPHONE_TEST_WDA_RESTART_MISSING,
  IPHONE_TEST_WDA_RESTART_NON_BOOLEAN,
  IPHONE_TEST_WDA_RESTART_REMOTE,
  IPHONE_TEST_WDA_RESTART_REMOTE_URL,
  IPHONE_TEST_WDA_RESTART_SUITE,
  IPHONE_TEST_WDA_RESTART_TRUE,
} from "./wda-restart-constants"
import { freeWdaTestPort, simulatorWdaConfig } from "./wda-support"

async function rejectsRestartOptIn(useNewWDA?: boolean): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const port = await freeWdaTestPort()
  const config = simulatorWdaConfig(base, port)
  config.capabilities = { wdaLocalPort: port }
  if (typeof useNewWDA === "boolean") {
    config.capabilities.useNewWDA = useNewWDA
  }
  const scenario = new WdaFactoryScenario(config)
  try {
    await expect(scenario.factory.create(new AbortController().signal)).rejects.toThrow(
      IPHONE_WDA_RESTART_OPT_IN_REQUIRED,
    )
    expect(server.requests).toBe(0)
  } finally {
    await scenario.stop()
    await server.stop()
  }
}

async function rejectsMissingOptIn(): Promise<void> {
  await rejectsRestartOptIn()
}

async function rejectsFalseOptIn(): Promise<void> {
  await rejectsRestartOptIn(false)
}

function rejectsIpv6MissingOptIn(): void {
  const config = simulatorWdaConfig(IPHONE_TEST_WDA_RESTART_IPV6_URL, 54321)
  config.capabilities = { wdaLocalPort: 54321 }
  expect(validateIphoneConfiguration(config, "darwin")).toEqual({
    kind: IPHONE_REFUSED,
    message: IPHONE_WDA_RESTART_OPT_IN_REQUIRED,
  })
}

function acceptsExplicitTrue(): void {
  const config = simulatorWdaConfig(IPHONE_TEST_WDA_RESTART_LOCAL_URL, 54321)
  expect(validateIphoneConfiguration(config, "darwin").kind).toBe(IPHONE_ACCEPTED)
  expect(buildIphoneCapabilities(config, "darwin")["appium:useNewWDA"]).toBe(true)
}

function preservesRemoteFalse(): void {
  const config = simulatorWdaConfig(IPHONE_TEST_WDA_RESTART_REMOTE_URL, 54321)
  config.capabilities = { useNewWDA: false }
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, config.capabilities)).toBe(true)
  expect(validateIphoneConfiguration(config, "darwin").kind).toBe(IPHONE_ACCEPTED)
  expect(buildIphoneCapabilities(config, "darwin")["appium:useNewWDA"]).toBe(false)
}

function preservesDeviceFalse(): void {
  const config = simulatorWdaConfig(IPHONE_TEST_WDA_RESTART_LOCAL_URL, 54321)
  config.target = {
    kind: IPHONE_DEVICE,
    udid: IPHONE_TEST_WDA_RESTART_DEVICE_UDID,
    deviceName: IPHONE_TEST_WDA_RESTART_DEVICE_NAME,
    wdaInstalled: true,
  }
  config.capabilities = { useNewWDA: false }
  expect(validateIphoneConfiguration(config, "darwin").kind).toBe(IPHONE_ACCEPTED)
  expect(buildIphoneCapabilities(config, "darwin")["appium:useNewWDA"]).toBe(false)
}

function preservesExplicitWdaFalse(): void {
  const config = simulatorWdaConfig(IPHONE_TEST_WDA_RESTART_LOCAL_URL, 54321)
  config.target.wdaUrl = IPHONE_TEST_WDA_RESTART_EXTERNAL_URL
  config.capabilities = { useNewWDA: false }
  expect(validateIphoneConfiguration(config, "darwin").kind).toBe(IPHONE_ACCEPTED)
  expect(buildIphoneCapabilities(config, "darwin")["appium:useNewWDA"]).toBe(false)
}

function rejectsNonBoolean(): void {
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { useNewWDA: "true" })).toBe(false)
}

function suite(): void {
  test(IPHONE_TEST_WDA_RESTART_MISSING, rejectsMissingOptIn)
  test(IPHONE_TEST_WDA_RESTART_FALSE, rejectsFalseOptIn)
  test(IPHONE_TEST_WDA_RESTART_IPV6, rejectsIpv6MissingOptIn)
  test(IPHONE_TEST_WDA_RESTART_TRUE, acceptsExplicitTrue)
  test(IPHONE_TEST_WDA_RESTART_REMOTE, preservesRemoteFalse)
  test(IPHONE_TEST_WDA_RESTART_DEVICE, preservesDeviceFalse)
  test(IPHONE_TEST_WDA_RESTART_EXTERNAL, preservesExplicitWdaFalse)
  test(IPHONE_TEST_WDA_RESTART_NON_BOOLEAN, rejectsNonBoolean)
}

describe(IPHONE_TEST_WDA_RESTART_SUITE, suite)
