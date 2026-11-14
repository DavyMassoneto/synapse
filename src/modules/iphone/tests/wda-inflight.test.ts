import { describe, expect, test } from "vitest"
import { TestIphoneHttpServer } from "./doubles"
import { WdaFactoryScenario } from "./wda-factory-scenario"
import { freeWdaTestPort, simulatorWdaConfig } from "./wda-support"

async function stopsPostedCreation(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const scenario = new WdaFactoryScenario(simulatorWdaConfig(base, await freeWdaTestPort()))
  server.holdSession = true
  server.responses = ['{"value":{"ready":true}}', '{"value":{"sessionId":"late"}}']
  try {
    const creating = scenario.factory.create(new AbortController().signal)
    const rejected = expect(creating).rejects.toThrow()
    await server.sessionRequested.promise
    await scenario.factory.stop()
    server.sessionReleased.resolve()
    await rejected
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(1)
  } finally {
    server.sessionReleased.resolve()
    await scenario.stop()
    await server.stop()
  }
}

function suite(): void {
  test("stop após POST não devolve sessão utilizável nem repete criação incerta", stopsPostedCreation)
}

describe("cancelamento criação WDA em andamento", suite)
