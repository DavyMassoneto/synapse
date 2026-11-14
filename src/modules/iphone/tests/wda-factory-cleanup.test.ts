import { describe, expect, test } from "vitest"
import { TestIphoneHttpServer } from "./doubles"
import { WdaFactoryScenario } from "./wda-factory-scenario"
import { freeWdaTestPort, simulatorWdaConfig } from "./wda-support"

async function releasesOnStop(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const config = simulatorWdaConfig(base, await freeWdaTestPort())
  const first = new WdaFactoryScenario(config)
  const second = new WdaFactoryScenario(config)
  const signal = new AbortController().signal
  try {
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"first"}}']
    await first.factory.create(signal)
    await first.factory.stop()
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"second"}}']
    await second.factory.create(signal)
    await first.factory.stop()
    await expect(first.factory.create(signal)).rejects.toThrow()
  } finally {
    await first.stop()
    await second.stop()
    await server.stop()
  }
}

async function abortBeforeCreation(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const scenario = new WdaFactoryScenario(simulatorWdaConfig(base, await freeWdaTestPort()))
  const controller = new AbortController()
  controller.abort()
  try {
    await expect(scenario.factory.create(controller.signal)).rejects.toThrow()
    expect(server.requests).toBe(0)
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"next"}}']
    await scenario.factory.create(new AbortController().signal)
  } finally {
    await scenario.stop()
    await server.stop()
  }
}

async function rejectsMissingPort(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const config = simulatorWdaConfig(base, await freeWdaTestPort())
  delete config.capabilities
  const scenario = new WdaFactoryScenario(config)
  try {
    await expect(scenario.factory.create(new AbortController().signal)).rejects.toThrow("wdaLocalPort")
    expect(server.requests).toBe(0)
  } finally {
    await scenario.stop()
    await server.stop()
  }
}

async function stopsPendingStatus(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const config = simulatorWdaConfig(base, await freeWdaTestPort())
  const first = new WdaFactoryScenario(config)
  const second = new WdaFactoryScenario(config)
  const signal = new AbortController().signal
  server.holdStatus = true
  try {
    const creating = first.factory.create(signal)
    const rejected = expect(creating).rejects.toThrow()
    await Promise.race([server.statusRequested.promise, creating])
    await first.factory.stop()
    server.holdStatus = false
    server.statusReleased.resolve()
    await rejected
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(0)
    server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"second"}}']
    await second.factory.create(signal)
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(1)
  } finally {
    server.statusReleased.resolve()
    await first.stop()
    await second.stop()
    await server.stop()
  }
}

async function stopsBeforeReservation(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const scenario = new WdaFactoryScenario(simulatorWdaConfig(base, await freeWdaTestPort()))
  try {
    const creating = scenario.factory.create(new AbortController().signal)
    const rejected = expect(creating).rejects.toThrow()
    await scenario.factory.stop()
    await rejected
    expect(server.requests).toBe(0)
  } finally {
    await scenario.stop()
    await server.stop()
  }
}

function suite(): void {
  test("stop na resolução do alvo impede reserva tardia e POST", stopsBeforeReservation)
  test("stop cancela status pendente antes de POST e libera para outra factory", stopsPendingStatus)
  test("stop libera somente reservas da factory dona", releasesOnStop)
  test("abort pré-criação não envia HTTP e permite próxima criação", abortBeforeCreation)
  test("porta ausente recusa sem default antes de Appium", rejectsMissingPort)
}

describe("encerramento admissão WDA", suite)
