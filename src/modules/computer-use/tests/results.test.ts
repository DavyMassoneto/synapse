import { describe, expect, test } from "vitest"
import { ComputerActionDispatch, computerDispatchJudgment } from "../internal"
import { ComputerTestCaptureStorage, ComputerTestWait } from "./doubles"
import { ComputerResultsDriver, computerResultsResponse, computerResultsService } from "./results"

function invalidInput(): void {
  const result = computerDispatchJudgment(
    { action: "click", element: 1 },
    { kind: "driver-invalid", message: "response corrupted" },
  )
  expect(result).toMatchObject({
    result: { kind: "outcome-unknown", retryAllowed: false },
    verdict: { decision: "verify-fresh-state", retryAllowed: false },
  })
  expect(result.verdict.message).not.toContain("provavelmente não teve efeito")
}

function refusedInput(): void {
  const response = computerResultsResponse()
  response.envelope.isError = true
  delete response.envelope.verified
  expect(computerDispatchJudgment({ action: "click", element: 1 }, response)).toMatchObject({
    result: { kind: "failed" },
    verdict: { decision: "escalate", retryAllowed: false },
  })
}

async function noInvalidReplay(): Promise<void> {
  const driver = new ComputerResultsDriver()
  driver.responses.input = { kind: "driver-invalid", message: "response corrupted" }
  const service = computerResultsService(driver)
  await service.execute({ action: "capture", pid: 1, windowId: 1 }, { sessionId: "s", modelSupportsImages: true })
  const result = await service.execute({ action: "click", element: 1 }, { sessionId: "s", modelSupportsImages: true })
  expect(result).toMatchObject({ result: { kind: "outcome-unknown" }, verdict: { decision: "verify-fresh-state" } })
  expect(driver.calls).toEqual(["start_session", "set_config", "get_window_state", "click"])
}

async function confirmedCaptureFailure(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const service = computerResultsService(driver)
  await service.execute({ action: "capture", pid: 1, windowId: 1 }, { sessionId: "s", modelSupportsImages: true })
  driver.responses.capture = { kind: "driver-error", message: "capture failed" }
  const result = await service.execute(
    { action: "click", element: 1, captureAfter: true },
    { sessionId: "s", modelSupportsImages: true },
  )
  expect(result).toMatchObject({
    result: { kind: "completed" },
    verdict: { decision: "done", retryAllowed: false },
    captureFailure: "capture failed",
  })
  expect(result).not.toHaveProperty("capture")
  expect(driver.calls).toEqual(["start_session", "set_config", "get_window_state", "click", "get_window_state"])
}

async function unconfirmedCaptureFailure(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const input = computerResultsResponse()
  delete input.envelope.verified
  driver.responses.input = input
  const service = computerResultsService(driver)
  await service.execute({ action: "capture", pid: 1, windowId: 1 }, { sessionId: "s", modelSupportsImages: true })
  driver.responses.capture = { kind: "driver-error", message: "capture failed" }
  expect(
    await service.execute(
      { action: "click", element: 1, captureAfter: true },
      { sessionId: "s", modelSupportsImages: true },
    ),
  ).toMatchObject({
    result: { kind: "unconfirmed" },
    verdict: { decision: "verify-fresh-state", retryAllowed: false },
    captureFailure: "capture failed",
  })
}

async function confirmedCapture(): Promise<void> {
  const service = computerResultsService(new ComputerResultsDriver())
  await service.execute({ action: "capture", pid: 1, windowId: 1 }, { sessionId: "s", modelSupportsImages: true })
  const result = await service.execute(
    { action: "click", element: 1, captureAfter: true },
    { sessionId: "s", modelSupportsImages: true },
  )
  expect(result).toMatchObject({ result: { kind: "completed" }, verdict: { decision: "done" } })
  expect(result).toHaveProperty("capture")
  expect(result).not.toHaveProperty("captureFailure")
}

async function nonexistentSelection(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const response = computerResultsResponse()
  response.envelope.windows = []
  driver.responses.selection = response
  const dispatch = new ComputerActionDispatch(
    driver,
    "darwin",
    new ComputerTestWait(),
    new ComputerTestCaptureStorage(),
  )
  expect(
    await dispatch.execute({ action: "focus_app", app: "missing" }, { sessionId: "s", modelSupportsImages: true }),
  ).toMatchObject({ result: { kind: "refused" }, verdict: { decision: "stop" } })
  expect(driver.calls).not.toContain("bring_to_front")
}

async function nonexistentFocus(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const response = computerResultsResponse()
  response.envelope.windows = []
  driver.responses.selection = response
  const dispatch = new ComputerActionDispatch(
    driver,
    "darwin",
    new ComputerTestWait(),
    new ComputerTestCaptureStorage(),
  )
  expect(
    await dispatch.execute(
      { action: "focus_app", app: "missing", raiseWindow: true },
      { sessionId: "s", modelSupportsImages: true },
    ),
  ).toMatchObject({ result: { kind: "refused" }, verdict: { decision: "stop" } })
  expect(driver.calls).not.toContain("bring_to_front")
}

async function existingSelection(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const dispatch = new ComputerActionDispatch(
    driver,
    "darwin",
    new ComputerTestWait(),
    new ComputerTestCaptureStorage(),
  )
  expect(
    await dispatch.execute({ action: "focus_app", app: "Editor" }, { sessionId: "s", modelSupportsImages: true }),
  ).toMatchObject({ result: { kind: "completed" }, verdict: { decision: "done" } })
  expect(driver.calls).not.toContain("bring_to_front")
}

async function existingFocus(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const dispatch = new ComputerActionDispatch(
    driver,
    "darwin",
    new ComputerTestWait(),
    new ComputerTestCaptureStorage(),
  )
  expect(
    await dispatch.execute(
      { action: "focus_app", app: "Editor", raiseWindow: true },
      { sessionId: "s", modelSupportsImages: true },
    ),
  ).toMatchObject({ result: { kind: "completed" }, verdict: { decision: "done" } })
  expect(driver.calls).toContain("bring_to_front")
}

function register(): void {
  test("resposta inválida preserva incerteza", invalidInput)
  test("recusa comprovada continua falha", refusedInput)
  test("não repete entrada com resposta inválida", noInvalidReplay)
  test("falha de captura preserva conclusão confirmada", confirmedCaptureFailure)
  test("falha de captura preserva entrada não confirmada", unconfirmedCaptureFailure)
  test("captura posterior bem-sucedida acompanha conclusão", confirmedCapture)
  test("recusa seleção de aplicativo inexistente", nonexistentSelection)
  test("recusa foco inexistente sem trazer janela", nonexistentFocus)
  test("seleciona aplicativo existente sem alterar foco", existingSelection)
  test("traz aplicativo existente à frente", existingFocus)
}

describe("resultados com portas em memória", register)
