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

async function stopDuringFocus(): Promise<void> {
  const driver = new ComputerPendingFocusDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  await service.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  const pending = service.execute(
    { action: "click", element: 1, bringToFront: true, deliveryMode: "foreground" },
    COMPUTER_CANCELLATION_CONTEXT,
  )
  await driver.focusEntered.promise
  await service.stop()
  const stoppedCalls = [...driver.calls]
  driver.focusResponse.resolve(COMPUTER_CANCELLATION_RESPONSE)
  expect(await pending).toMatchObject({
    result: { kind: "cancelled" },
    precedingEffects: [{ kind: "completed", action: "focus_app" }],
  })
  expect(driver.calls).toEqual(stoppedCalls)
  expect(driver.calls.filter(isCombinedClick)).toHaveLength(0)
  expect((await service.execute({ action: "list_apps" }, COMPUTER_CANCELLATION_CONTEXT)).kind).toBe(
    "computer-apps-listed",
  )
  await service.stop()
}

async function focusCompletesNormally(): Promise<void> {
  const driver = new ComputerPendingFocusDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  await service.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  const pending = service.execute(
    { action: "click", element: 1, bringToFront: true, deliveryMode: "foreground" },
    COMPUTER_CANCELLATION_CONTEXT,
  )
  await driver.focusEntered.promise
  driver.focusResponse.resolve(COMPUTER_CANCELLATION_RESPONSE)
  expect(await pending).toMatchObject({
    result: { kind: "completed" },
    precedingEffects: [{ kind: "completed", action: "focus_app" }],
  })
  expect(driver.calls.filter(isCombinedClick)).toHaveLength(1)
  await service.stop()
}

async function focusRemainsUnknownAfterStop(): Promise<void> {
  const driver = new ComputerPendingFocusDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  await service.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  const pending = service.execute(
    { action: "click", element: 1, bringToFront: true, deliveryMode: "foreground" },
    COMPUTER_CANCELLATION_CONTEXT,
  )
  await driver.focusEntered.promise
  await service.stop()
  const stoppedCalls = [...driver.calls]
  driver.focusResponse.resolve({ kind: "driver-timeout", message: "focus may have happened" })
  expect(await pending).toMatchObject({
    result: { kind: "outcome-unknown" },
    precedingEffects: [{ kind: "outcome-unknown", action: "focus_app" }],
  })
  expect(driver.calls).toEqual(stoppedCalls)
  expect(driver.calls.filter(isCombinedClick)).toHaveLength(0)
}

function register(): void {
  test("foco confirmado permite entrada sem stop", focusCompletesNormally)
  test("foco incerto após stop não provoca entrada", focusRemainsUnknownAfterStop)
  test("stop pendant foco impede continuação antiga", stopDuringFocus)
  test("stop e abort pós-envio preservam confirmação", stopAfterSentConfirmed)
  test("stop e abort pós-envio preservam incerteza sem reabrir", stopAfterSentUnknown)
}

describe("composição de lifecycle e cancelamento", register)
