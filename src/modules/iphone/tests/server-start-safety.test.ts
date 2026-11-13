import { afterEach, describe, expect, test, vi } from "vitest"
import { type IphoneAppiumExecutor, IphoneAppiumProcess } from "#synapse/modules/iphone/adapters/appium-process"
import { startIphoneServer } from "#synapse/modules/iphone/adapters/webdriver-http"
import { IPHONE_LIFECYCLE_DEPENDENCIES } from "./constants"
import { type IphoneLifecycleResolve } from "./types"

async function unusedExecutor(): Promise<never> {
  throw new Error("não deve executar processo")
}

async function delayedNegative(): Promise<Response> {
  await new Promise<void>(nextTurn)
  return new Response("", { status: 503 })
}

function nextTurn(resolve: IphoneLifecycleResolve): void {
  setTimeout(resolve, 0)
}

async function rejectsAfterAbortWithoutSpawn(): Promise<void> {
  vi.stubGlobal("fetch", delayedNegative)
  const executor: IphoneAppiumExecutor = unusedExecutor
  const server = new IphoneAppiumProcess(executor)
  const start = vi.spyOn(server, "start")
  const controller = new AbortController()
  const pending = startIphoneServer(
    {
      serverUrl: "http://127.0.0.1:1",
      target: { kind: "device", udid: "fake", deviceName: "fake", wdaInstalled: true },
    },
    IPHONE_LIFECYCLE_DEPENDENCIES,
    server,
    controller.signal,
  )
  controller.abort()
  await expect(pending).rejects.toThrow()
  expect(start).not.toHaveBeenCalled()
  await server.stop()
}

function cleanup(): void {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
}

function suite(): void {
  afterEach(cleanup)
  test("recusa status negativo tardio antes de spawn", rejectsAfterAbortWithoutSpawn)
}

describe("início do servidor", suite)
