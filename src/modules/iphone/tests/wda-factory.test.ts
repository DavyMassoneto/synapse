import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { describe, expect, test, vi } from "vitest"
import {
  IPHONE_WDA_DEFAULT_BIND_HOSTS,
  IPHONE_WDA_ENDPOINT_BUSY,
  IPHONE_WDA_IPV4_WILDCARD,
  IPHONE_WDA_LINUX,
  IPHONE_WDA_LINUX_BIND_HOSTS,
  IphoneWdaSocket,
} from "#synapse/modules/iphone/adapters/wda-admission"
import { IPHONE_TEST_HTTP_STATUS_PATH, TestIphoneHttpServer } from "./doubles"
import {
  IPHONE_TEST_WDA_BIND_METHOD,
  IPHONE_TEST_WDA_BIND_PLAN_IPV4_BUSY,
  IPHONE_TEST_WDA_CLOSE_METHOD,
} from "./wda-bind-plan-constants"
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
  const config = simulatorWdaConfig(base, Number(new URL(base).port))
  const first = new WdaFactoryScenario(config)
  const second = new WdaFactoryScenario(config)
  const signal = new AbortController().signal
  const hosts = process.platform === IPHONE_WDA_LINUX ? IPHONE_WDA_LINUX_BIND_HOSTS : IPHONE_WDA_DEFAULT_BIND_HOSTS
  const bind = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_BIND_METHOD).mockResolvedValue(undefined)
  const close = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_CLOSE_METHOD).mockResolvedValue(undefined)
  server.statusPath.hold = true
  try {
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"owned"}}']
    const creating = first.factory.create(signal)
    await Promise.race([server.statusPath.requested.promise, creating])
    expect(bind).toHaveBeenCalledTimes(hosts.length)
    expect(close).not.toHaveBeenCalled()
    expect(server.paths).toEqual([IPHONE_TEST_HTTP_STATUS_PATH])
    await expect(second.factory.create(signal)).rejects.toThrow(IPHONE_WDA_ENDPOINT_BUSY)
    expect(bind).toHaveBeenCalledTimes(hosts.length)
    expect(server.paths).toEqual([IPHONE_TEST_HTTP_STATUS_PATH])
    server.statusPath.hold = false
    server.statusPath.released.resolve()
    const session = await creating
    expect(close).toHaveBeenCalledTimes(hosts.length)
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(1)
    expect(server.bodies.join("")).toContain(`"appium:wdaLocalPort":${config.capabilities?.wdaLocalPort}`)
    expect(server.bodies.join("")).toContain('"appium:wdaBindingIP":"127.0.0.1"')
    await expect(second.factory.create(signal)).rejects.toThrow(IPHONE_WDA_ENDPOINT_BUSY)
    expect(server.requests).toBe(2)
    server.response = '{"value":null}'
    await session.dispose(signal)
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"next"}}']
    await second.factory.create(signal)
    expect(bind).toHaveBeenCalledTimes(hosts.length * 2)
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(2)
  } finally {
    server.statusPath.released.resolve()
    await first.stop()
    await second.stop()
    await server.stop()
    vi.restoreAllMocks()
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
