import { describe, expect, test } from "vitest"
import { ComputerDriverSession, ComputerUseService } from "../internal"
import { LifecycleInfrastructure, LifecyclePendingReadDriver, LifecycleStartingDriver } from "./lifecycle"

async function testWait(_milliseconds: number): Promise<void> {}

function makeService(infrastructure: LifecycleInfrastructure): ComputerUseService {
  return new ComputerUseService(
    {
      platform: "linux",
      installationDirectory: "test",
      captureDirectory: "test",
      wait: { wait: testWait },
      environment: {},
    },
    infrastructure,
  )
}

async function stopPendingStartup(): Promise<void> {
  const infrastructure = new LifecycleInfrastructure()
  const service = makeService(infrastructure)
  const execution = service.execute({ action: "list_apps" }, { sessionId: "s", modelSupportsImages: false })
  await service.stop()
  infrastructure.releaseLaunch()
  expect(await execution).toMatchObject({ kind: "computer-executed", result: { kind: "failed" } })
  expect(infrastructure.calls).toEqual([])
}

async function stopQueuedAction(): Promise<void> {
  const infrastructure = new LifecycleInfrastructure()
  const service = makeService(infrastructure)
  const first = service.execute({ action: "list_apps" }, { sessionId: "s", modelSupportsImages: false })
  const queued = service.execute({ action: "list_windows" }, { sessionId: "s", modelSupportsImages: false })
  await service.stop()
  infrastructure.releaseLaunch()
  await first
  expect(await queued).toMatchObject({ kind: "computer-executed", result: { kind: "failed" } })
  expect(infrastructure.calls).toEqual([])
}

async function newRequestAfterStop(): Promise<void> {
  const infrastructure = new LifecycleInfrastructure()
  const service = makeService(infrastructure)
  await service.stop()
  infrastructure.releaseLaunch()
  expect((await service.execute({ action: "list_apps" }, { sessionId: "s", modelSupportsImages: false })).kind).toBe(
    "computer-apps-listed",
  )
  await service.stop()
  expect(infrastructure.calls).toContain("end_session")
}

async function stopDuringDriverStart(): Promise<void> {
  const driver = new LifecycleStartingDriver()
  const session = new ComputerDriverSession(driver, "s", true)
  const starting = session.start()
  const rejected = expect(starting).rejects.toThrow()
  const stopping = session.stop()
  driver.releaseStart()
  await stopping
  await rejected
  expect(driver.calls).not.toContain("start_session")
  expect(driver.calls).toContain("stop")
}

async function noReadRetryAfterStop(): Promise<void> {
  const driver = new LifecyclePendingReadDriver()
  const session = new ComputerDriverSession(driver, "s", true)
  await session.start()
  const read = session.call("list_windows", {})
  await driver.requested
  await session.stop()
  const callsAtStop = [...driver.calls]
  driver.disconnectRead()
  expect((await read).kind).toBe("driver-disconnected")
  expect(driver.calls).toEqual(callsAtStop)
}

function register(): void {
  test("leitura tardia não reabre após stop", noReadRetryAfterStop)
  test("stop recusa início de driver suspenso", stopDuringDriverStart)
  test("stop impede startup suspenso de iniciar depois", stopPendingStartup)
  test("stop recusa ação já enfileirada", stopQueuedAction)
  test("pedido novo após stop pode reabrir", newRequestAfterStop)
}

describe("ciclo de vida do computador", register)
