import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { describe, expect, test } from "vitest"
import { IPHONE_WDA_IPV4_WILDCARD } from "#synapse/modules/iphone/adapters/wda-admission"
import { TestIphoneHttpServer } from "./doubles"
import { IPHONE_TEST_WDA_BIND_PLAN_IPV4_BUSY } from "./wda-bind-plan-constants"
import { WdaFactoryScenario } from "./wda-factory-scenario"
import { closeWdaTest, freeWdaTestPort, listenWdaTest, simulatorWdaConfig } from "./wda-support"

let foreignRequests = 0

function foreignResponse(_request: IncomingMessage, response: ServerResponse): void {
  foreignRequests++
  response.end()
}

async function refusesOccupied(host: string): Promise<void> {
  const foreign = createServer(foreignResponse)
  const port = await listenWdaTest(foreign, host, 0)
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const scenario = new WdaFactoryScenario(simulatorWdaConfig(base, port))
  foreignRequests = 0
  try {
    await expect(scenario.factory.create(new AbortController().signal)).rejects.toThrow()
    expect(server.requests).toBe(0)
    expect(foreignRequests).toBe(0)
    expect(foreign.listening).toBe(true)
  } finally {
    await scenario.stop()
    await server.stop()
    await closeWdaTest(foreign)
  }
}

async function refusesIpv4(): Promise<void> {
  await refusesOccupied("127.0.0.1")
}

async function refusesIpv6(): Promise<void> {
  await refusesOccupied("::1")
}

async function refusesWildcard(): Promise<void> {
  await refusesOccupied("::")
}

async function admitsOneFactory(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const config = simulatorWdaConfig(base, await freeWdaTestPort())
  const first = new WdaFactoryScenario(config)
  const second = new WdaFactoryScenario(config)
  const signal = new AbortController().signal
  try {
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"owned"}}']
    const creating = first.factory.create(signal)
    await expect(second.factory.create(signal)).rejects.toThrow()
    const session = await creating
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(1)
    expect(server.bodies.join("")).toContain(`"appium:wdaLocalPort":${config.capabilities?.wdaLocalPort}`)
    expect(server.bodies.join("")).toContain('"appium:wdaBindingIP":"127.0.0.1"')
    server.response = '{"value":null}'
    await session.dispose(signal)
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"next"}}']
    await second.factory.create(signal)
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(2)
  } finally {
    await first.stop()
    await second.stop()
    await server.stop()
  }
}

async function releasesFailedCreation(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const scenario = new WdaFactoryScenario(simulatorWdaConfig(base, await freeWdaTestPort()))
  const signal = new AbortController().signal
  try {
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":4}}']
    await expect(scenario.factory.create(signal)).rejects.toThrow()
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"next"}}']
    await scenario.factory.create(signal)
  } finally {
    await scenario.stop()
    await server.stop()
  }
}

function suite(): void {
  test("ocupação IPv4 recusa antes de qualquer HTTP", refusesIpv4)
  test("ocupação IPv6 recusa antes de qualquer HTTP", refusesIpv6)
  test("ocupação wildcard recusa antes de qualquer HTTP", refusesWildcard)
  test(IPHONE_TEST_WDA_BIND_PLAN_IPV4_BUSY, refusesOccupied.bind(null, IPHONE_WDA_IPV4_WILDCARD))
  test("duas factories só admitem uma sessão até dispose", admitsOneFactory)
  test("criação recusada libera reserva", releasesFailedCreation)
}

describe("isolamento WDA local", suite)
