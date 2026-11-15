import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import { IPHONE_CONFIG_CAPABILITIES_SCHEMA } from "#synapse/modules/iphone/adapters/configuration-file"
import {
  IPHONE_WDA_IPV4_LOOPBACK,
  IPHONE_WDA_IPV4_WILDCARD,
  IPHONE_WDA_IPV6_LOOPBACK,
  IPHONE_WDA_IPV6_WILDCARD,
} from "#synapse/modules/iphone/adapters/wda-admission"
import { validateIphoneConfiguration } from "#synapse/modules/iphone/internal/configuration"
import { IPHONE_MJPEG_PORT_CONFLICT, IPHONE_MJPEG_PORT_REQUIRED } from "#synapse/modules/iphone/internal/wda-endpoint"
import { IPHONE_ACCEPTED, IPHONE_DEVICE } from "#synapse/modules/iphone/public/contracts"
import { TestIphoneHttpServer } from "./doubles"
import * as texts from "./mjpeg-constants"
import { WdaFactoryScenario } from "./wda-factory-scenario"
import { closeWdaTest, freeWdaTestPort, listenWdaTest, simulatorWdaConfig } from "./wda-support"

let foreignRequests = 0

function observeForeign(_request: IncomingMessage, response: ServerResponse): void {
  foreignRequests++
  response.end()
}

async function rejectsConfiguration(mjpegPort: number): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const config = simulatorWdaConfig(base, 54321, 54322)
  config.capabilities = { wdaLocalPort: 54321, mjpegServerPort: mjpegPort, useNewWDA: true }
  const scenario = new WdaFactoryScenario(config)
  try {
    const creating = scenario.factory.create(new AbortController().signal)
    if (mjpegPort === 54321) {
      await expect(creating).rejects.toThrow(IPHONE_MJPEG_PORT_CONFLICT)
    } else {
      await expect(creating).rejects.toThrow()
    }
    expect(server.requests).toBe(0)
  } finally {
    await scenario.stop()
    await server.stop()
  }
}

async function rejectsMissingMjpeg(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const config = simulatorWdaConfig(base, 54321, 54322)
  config.capabilities = { wdaLocalPort: 54321, useNewWDA: true }
  const scenario = new WdaFactoryScenario(config)
  try {
    await expect(scenario.factory.create(new AbortController().signal)).rejects.toThrow(IPHONE_MJPEG_PORT_REQUIRED)
    expect(server.requests).toBe(0)
  } finally {
    await scenario.stop()
    await server.stop()
  }
}

async function rejectsOccupiedMjpeg(host: string): Promise<void> {
  const foreign = createServer(observeForeign)
  const port = await listenWdaTest(foreign, host, 0)
  const wdaPort = await freeWdaTestPort()
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const scenario = new WdaFactoryScenario(simulatorWdaConfig(base, wdaPort, port))
  const check = createServer()
  foreignRequests = 0
  try {
    await expect(scenario.factory.create(new AbortController().signal)).rejects.toThrow()
    expect(server.requests).toBe(0)
    expect(foreignRequests).toBe(0)
    expect(foreign.listening).toBe(true)
    await listenWdaTest(check, IPHONE_WDA_IPV4_LOOPBACK, wdaPort)
  } finally {
    await scenario.stop()
    await server.stop()
    if (check.listening) {
      await closeWdaTest(check)
    }
    await closeWdaTest(foreign)
  }
}

function validatesMjpegSchema(): void {
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { mjpegServerPort: 54322 })).toBe(true)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { mjpegServerPort: 0 })).toBe(false)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { mjpegServerPort: -1 })).toBe(false)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { mjpegServerPort: 65536 })).toBe(false)
  expect(Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { mjpegServerPort: 1.5 })).toBe(false)
  expect(
    Value.Check(IPHONE_CONFIG_CAPABILITIES_SCHEMA, { mjpegServerPort: texts.IPHONE_TEST_MJPEG_REJECTED_STRING }),
  ).toBe(false)
}

function preservesRemoteTarget(): void {
  const remote = simulatorWdaConfig(texts.IPHONE_TEST_MJPEG_REMOTE_URL, 54321, 54322)
  delete remote.capabilities
  expect(validateIphoneConfiguration(remote, "darwin").kind).toBe(IPHONE_ACCEPTED)
}

function preservesExplicitWda(): void {
  const external = simulatorWdaConfig(texts.IPHONE_TEST_MJPEG_LOCAL_URL, 54321, 54322)
  external.target.wdaUrl = texts.IPHONE_TEST_MJPEG_EXTERNAL_URL
  delete external.capabilities
  expect(validateIphoneConfiguration(external, "darwin").kind).toBe(IPHONE_ACCEPTED)
}

function preservesPhysicalTarget(): void {
  const external = simulatorWdaConfig(texts.IPHONE_TEST_MJPEG_LOCAL_URL, 54321, 54322)
  delete external.capabilities
  external.target = {
    kind: IPHONE_DEVICE,
    udid: texts.IPHONE_TEST_MJPEG_DEVICE_UDID,
    deviceName: texts.IPHONE_TEST_MJPEG_DEVICE_NAME,
    wdaInstalled: true,
  }
  expect(validateIphoneConfiguration(external, "darwin").kind).toBe(IPHONE_ACCEPTED)
}

function suite(): void {
  test(texts.IPHONE_TEST_MJPEG_MISSING, rejectsMissingMjpeg)
  test(texts.IPHONE_TEST_MJPEG_EQUAL, rejectsConfiguration.bind(null, 54321))
  test(texts.IPHONE_TEST_MJPEG_INVALID, rejectsConfiguration.bind(null, 65536))
  test(texts.IPHONE_TEST_MJPEG_IPV4, rejectsOccupiedMjpeg.bind(null, IPHONE_WDA_IPV4_LOOPBACK))
  test(texts.IPHONE_TEST_MJPEG_IPV6, rejectsOccupiedMjpeg.bind(null, IPHONE_WDA_IPV6_LOOPBACK))
  test(texts.IPHONE_TEST_MJPEG_WILDCARD4, rejectsOccupiedMjpeg.bind(null, IPHONE_WDA_IPV4_WILDCARD))
  test(texts.IPHONE_TEST_MJPEG_WILDCARD6, rejectsOccupiedMjpeg.bind(null, IPHONE_WDA_IPV6_WILDCARD))
  test(texts.IPHONE_TEST_MJPEG_SCHEMA, validatesMjpegSchema)
  test(texts.IPHONE_TEST_MJPEG_REMOTE, preservesRemoteTarget)
  test(texts.IPHONE_TEST_MJPEG_EXTERNAL, preservesExplicitWda)
  test(texts.IPHONE_TEST_MJPEG_PHYSICAL, preservesPhysicalTarget)
}

describe(texts.IPHONE_TEST_MJPEG_SUITE, suite)
