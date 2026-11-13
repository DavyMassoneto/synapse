import { describe, expect, test } from "vitest"
import { ComputerActionDispatch, ComputerDriverSession, ComputerUseService } from "../internal"
import {
  COMPUTER_CANCELLATION_CONTEXT,
  COMPUTER_CANCELLATION_DEPENDENCIES,
  COMPUTER_CANCELLATION_RESPONSE,
  ComputerCancellationDriver,
  isCapture,
  isClick,
  isList,
} from "./cancellation"
import { ComputerTestWait } from "./doubles"

function makeDispatch(driver: ComputerCancellationDriver): ComputerActionDispatch {
  return new ComputerActionDispatch(
    new ComputerDriverSession(driver, "test", false),
    "darwin",
    new ComputerTestWait(),
    driver.storage,
  )
}

async function cancelledBeforeService(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  driver.controller.abort()
  const result = await service.execute(
    { action: "click", element: 1 },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  expect(result).toMatchObject({ result: { kind: "cancelled" }, verdict: { retryAllowed: false } })
  expect(driver.calls).toEqual([])
}

async function cancelledDuringStartup(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  driver.holdStart = true
  const pending = makeDispatch(driver).execute(
    { action: "click", element: 1 },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  await driver.startEntered.promise
  driver.controller.abort()
  driver.startResponse.resolve([])
  expect(await pending).toMatchObject({ result: { kind: "cancelled" } })
  expect(driver.calls).not.toContain("click")
}

async function cancelledDuringConfirmedInput(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  driver.holdInput = true
  const dispatch = makeDispatch(driver)
  await dispatch.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  const pending = dispatch.execute(
    { action: "click", element: 1, captureAfter: true },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  await driver.inputEntered.promise
  driver.controller.abort()
  driver.inputResponse.resolve(COMPUTER_CANCELLATION_RESPONSE)
  expect(await pending).toMatchObject({
    result: { kind: "completed", message: "confirmed evidence" },
    captureFailure: expect.stringContaining("cancelada"),
    verdict: { retryAllowed: false },
  })
  expect(driver.calls.filter(isClick)).toHaveLength(1)
  expect(driver.calls.filter(isCapture)).toHaveLength(1)
}

async function cancelledDuringUnknownInput(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  driver.holdInput = true
  const dispatch = makeDispatch(driver)
  await dispatch.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  const pending = dispatch.execute(
    { action: "click", element: 1 },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  await driver.inputEntered.promise
  driver.controller.abort()
  driver.inputResponse.resolve({ kind: "driver-timeout", message: "input may have happened" })
  expect(await pending).toMatchObject({
    result: { kind: "outcome-unknown", retryAllowed: false },
    verdict: { retryAllowed: false },
  })
  expect(driver.calls.filter(isClick)).toHaveLength(1)
}

async function cancelledAfterFocus(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  const dispatch = makeDispatch(driver)
  await dispatch.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  driver.abortAfterCall = "bring_to_front"
  const result = await dispatch.execute(
    { action: "click", element: 1, bringToFront: true },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  expect(result).toMatchObject({ result: { kind: "cancelled" }, precedingEffects: [{ kind: "completed" }] })
  expect(driver.calls).not.toContain("click")
}

async function cancelledQueuedInput(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  driver.holdStart = true
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  const first = service.execute({ action: "list_apps" }, COMPUTER_CANCELLATION_CONTEXT)
  await driver.startEntered.promise
  const queued = service.execute(
    { action: "click", element: 1 },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  driver.controller.abort()
  driver.startResponse.resolve([])
  await first
  expect(await queued).toMatchObject({ result: { kind: "cancelled" } })
  expect(driver.calls).not.toContain("click")
}

async function cancelledReadDoesNotRetry(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  driver.abortAfterCall = "list_apps"
  driver.timeoutCall = "list_apps"
  const session = new ComputerDriverSession(driver, "test", false)
  const result = await session.call("list_apps", {}, driver.controller.signal)
  expect(result.kind).toBe("driver-timeout")
  expect(driver.calls.filter(isList)).toHaveLength(1)
}

async function cancelledAfterCompletedInput(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  const dispatch = makeDispatch(driver)
  await dispatch.execute({ action: "capture", pid: 10, windowId: 20 }, COMPUTER_CANCELLATION_CONTEXT)
  const result = await dispatch.execute(
    { action: "click", element: 1 },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  driver.controller.abort()
  expect(result).toMatchObject({
    result: { kind: "completed", message: "confirmed evidence" },
    verdict: { retryAllowed: false },
  })
  expect(driver.calls.filter(isClick)).toHaveLength(1)
}

async function refusedUnsafeInput(): Promise<void> {
  const driver = new ComputerCancellationDriver()
  const service = new ComputerUseService(COMPUTER_CANCELLATION_DEPENDENCIES, driver)
  const result = await service.execute(
    { action: "key", keys: "cmd+shift+q" },
    COMPUTER_CANCELLATION_CONTEXT,
    driver.controller.signal,
  )
  expect(result).toMatchObject({ result: { kind: "refused" } })
  expect(driver.calls).toEqual([])
}

function register(): void {
  test("cancela antes de montar o driver", cancelledBeforeService)
  test("cancela durante startup antes da entrada", cancelledDuringStartup)
  test("preserva confirmação e explica captura cancelada", cancelledDuringConfirmedInput)
  test("preserva incerteza depois do envio sem repetir entrada", cancelledDuringUnknownInput)
  test("preserva efeito de foco anterior à entrada cancelada", cancelledAfterFocus)
  test("impede entrada cancelada enquanto aguardava a fila", cancelledQueuedInput)
  test("não repete leitura com timeout depois de abort", cancelledReadDoesNotRetry)
  test("preserva resultado concluído antes do abort", cancelledAfterCompletedInput)
  test("recusa entrada insegura sem driver", refusedUnsafeInput)
}

describe("cancelamento do computador", register)
