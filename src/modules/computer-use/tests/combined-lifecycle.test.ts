import { describe, expect, test } from "vitest"
import { ComputerUseService } from "../internal"
import {
  COMPUTER_CANCELLATION_CONTEXT,
  COMPUTER_CANCELLATION_DEPENDENCIES,
  COMPUTER_CANCELLATION_RESPONSE,
  ComputerCancellationDriver,
  ComputerPendingFocusDriver,
} from "./cancellation"

async function stopAfterSentConfirmed(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  await service.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  driver.holdInput = true
  const pending = service.execute(
    { action: "click", element: 1, captureAfter: true },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  await driver.inputEntered.promise
  await service.stop()
  const stoppedCalls = [...driver.calls]
  driver.controller.abort()
  driver.inputResponse.resolve(COMPUTER_CANCELLATION_RESPONSE)
  expect(await pending).toMatchObject({
    result: { kind: "completed" },
    captureFailure: expect.stringContaining("cancelada"),
    verdict: { retryAllowed: false },
  })
  expect(driver.calls).toEqual(stoppedCalls)
  expect(driver.calls.filter(isCombinedClick)).toHaveLength(1)
}

async function stopAfterSentUnknown(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  await service.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  driver.holdInput = true
  const pending = service.execute(
    { action: "click", element: 1, captureAfter: true },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  await driver.inputEntered.promise
  await service.stop()
  const stoppedCalls = [...driver.calls]
  driver.controller.abort()
  driver.inputResponse.resolve({ kind: "driver-timeout", message: "may have happened" })
  expect(await pending).toMatchObject({ result: { kind: "outcome-unknown", retryAllowed: false } })
  expect(driver.calls).toEqual(stoppedCalls)
  expect(driver.calls.filter(isCombinedClick)).toHaveLength(1)
}

function isCombinedClick(name: string): boolean {
  return name === "click"
}

async function refusesForegroundBeforeDriver(): Promise<void> {
  const driver = new ComputerPendingFocusDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  await service.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  const callsBefore = [...driver.calls]
  const result = await service.execute(
    { action: "click", element: 1, bringToFront: true, deliveryMode: "foreground" },
    COMPUTER_CANCELLATION_CONTEXT,
  )
  expect(result).toMatchObject({ result: { kind: "refused" }, verdict: { decision: "stop", retryAllowed: false } })
  expect(driver.calls).toEqual(callsBefore)
  await service.stop()
}

async function refusesRaiseWindowBeforeDriver(): Promise<void> {
  const driver = new ComputerPendingFocusDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  const result = await service.execute(
    { action: "focus_app", app: "Editor", raiseWindow: true },
    COMPUTER_CANCELLATION_CONTEXT,
  )
  expect(result).toMatchObject({ result: { kind: "refused" }, verdict: { decision: "stop", retryAllowed: false } })
  expect(driver.calls).toEqual([])
  await service.stop()
}

async function stopKeepsLifecycleAfterRefusal(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  const refused = await service.execute(
    { action: "click", element: 1, deliveryMode: "foreground" },
    COMPUTER_CANCELLATION_CONTEXT,
  )
  expect(refused).toMatchObject({ result: { kind: "refused" } })
  await service.stop()
  expect((await service.execute({ action: "list_apps" }, COMPUTER_CANCELLATION_CONTEXT)).kind).toBe(
    "computer-apps-listed",
  )
  await service.stop()
}

function register(): void {
  test("recusa primeiro plano antes do driver", refusesForegroundBeforeDriver)
  test("recusa elevar janela antes do driver", refusesRaiseWindowBeforeDriver)
  test("stop mantém o ciclo utilizável após recusa", stopKeepsLifecycleAfterRefusal)
  test("stop e abort pós-envio preservam confirmação", stopAfterSentConfirmed)
  test("stop e abort pós-envio preservam incerteza sem reabrir", stopAfterSentUnknown)
}

describe("composição de lifecycle e cancelamento", register)
