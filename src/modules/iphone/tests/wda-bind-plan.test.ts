import { describe, expect, test, vi } from "vitest"
import {
  IPHONE_WDA_DEFAULT_BIND_HOSTS,
  IPHONE_WDA_LINUX,
  IPHONE_WDA_LINUX_BIND_HOSTS,
  IphoneWdaAdmission,
  type IphoneWdaAdmissions,
  IphoneWdaSocket,
} from "#synapse/modules/iphone/adapters/wda-admission"
import { TestIphoneHttpServer } from "./doubles"
import {
  IPHONE_TEST_WDA_BIND_METHOD,
  IPHONE_TEST_WDA_BIND_PLAN_DISPOSE_RESPONSE,
  IPHONE_TEST_WDA_BIND_PLAN_FACTORY,
  IPHONE_TEST_WDA_BIND_PLAN_RESPONSES,
  IPHONE_TEST_WDA_BIND_PLAN_SIMULTANEOUS,
  IPHONE_TEST_WDA_BIND_PLAN_SUITE,
  IPHONE_TEST_WDA_CLOSE_METHOD,
} from "./wda-bind-plan-constants"
import { WdaFactoryScenario } from "./wda-factory-scenario"
import { freeWdaTestPort, simulatorWdaConfig } from "./wda-support"

async function retainsRuntimeBindings(): Promise<void> {
  const owners: IphoneWdaAdmissions = new Set()
  const admission = new IphoneWdaAdmission(await freeWdaTestPort(), owners)
  const signal = new AbortController().signal
  const bind = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_BIND_METHOD)
  const close = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_CLOSE_METHOD)
  try {
    await admission.reserve(signal)
    const hosts = process.platform === IPHONE_WDA_LINUX ? IPHONE_WDA_LINUX_BIND_HOSTS : IPHONE_WDA_DEFAULT_BIND_HOSTS
    expect(bind).toHaveBeenCalledTimes(hosts.length)
    for (const [index, host] of hosts.entries()) {
      expect(bind).toHaveBeenNthCalledWith(index + 1, host, expect.any(Number))
    }
    expect(close).not.toHaveBeenCalled()
    expect(owners.size).toBe(1)
    await admission.handoff(signal)
    expect(close).toHaveBeenCalledTimes(hosts.length)
    expect(owners.size).toBe(1)
  } finally {
    await admission.release()
    vi.restoreAllMocks()
  }
}

async function factoryUsesRuntimePlatform(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const scenario = new WdaFactoryScenario(simulatorWdaConfig(base, await freeWdaTestPort()))
  const bind = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_BIND_METHOD)
  try {
    server.responses = [...IPHONE_TEST_WDA_BIND_PLAN_RESPONSES]
    const session = await scenario.factory.create(new AbortController().signal)
    const hosts = process.platform === IPHONE_WDA_LINUX ? IPHONE_WDA_LINUX_BIND_HOSTS : IPHONE_WDA_DEFAULT_BIND_HOSTS
    expect(bind).toHaveBeenCalledTimes(hosts.length)
    for (const [index, host] of hosts.entries()) {
      expect(bind).toHaveBeenNthCalledWith(index + 1, host, expect.any(Number))
    }
    server.response = IPHONE_TEST_WDA_BIND_PLAN_DISPOSE_RESPONSE
    await session.dispose(new AbortController().signal)
  } finally {
    await scenario.stop()
    await server.stop()
    vi.restoreAllMocks()
  }
}

function suite(): void {
  test(IPHONE_TEST_WDA_BIND_PLAN_SIMULTANEOUS, retainsRuntimeBindings)
  test(IPHONE_TEST_WDA_BIND_PLAN_FACTORY, factoryUsesRuntimePlatform)
}

describe(IPHONE_TEST_WDA_BIND_PLAN_SUITE, suite)
