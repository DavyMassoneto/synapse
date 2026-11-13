import { describe, expect, test } from "vitest"
import {
  COMPUTER_CANCELLATION_CANCELLED,
  COMPUTER_CANCELLATION_CAPTURE,
  COMPUTER_CANCELLATION_CAPTURE_FAILURE,
  COMPUTER_CANCELLATION_COMPLETED,
  COMPUTER_CANCELLATION_FAILED,
  COMPUTER_CANCELLATION_PRECEDING_EFFECTS,
  COMPUTER_CANCELLATION_REFUSED,
  COMPUTER_CANCELLATION_UNKNOWN,
  computerCancellationSut,
} from "../fixtures"

async function refusesPreAborted(): Promise<void> {
  const sut = computerCancellationSut()
  sut.controller.abort()
  const result = await sut.handler.execute(
    "call",
    { action: "list_apps" },
    sut.controller.signal,
    undefined,
    sut.context,
  )
  expect(result.isError).toBe(true)
  expect(sut.computer.calls).toBe(0)
}

async function forwardsSignal(): Promise<void> {
  const sut = computerCancellationSut()
  await sut.handler.execute("call", { action: "list_apps" }, sut.controller.signal, undefined, sut.context)
  expect(sut.computer.signal).toBe(sut.controller.signal)
}

async function preservesCompleted(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.abortOnExecute = sut.controller
  const result = await sut.handler.execute("call", { action: "click" }, sut.controller.signal, undefined, sut.context)
  expect(result.details?.result).toEqual(COMPUTER_CANCELLATION_COMPLETED)
  expect(result.isError).toBe(false)
}

async function preservesUnknown(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.result = COMPUTER_CANCELLATION_UNKNOWN
  sut.computer.abortOnExecute = sut.controller
  const result = await sut.handler.execute("call", { action: "click" }, sut.controller.signal, undefined, sut.context)
  expect(result.details?.result).toEqual(COMPUTER_CANCELLATION_UNKNOWN)
  expect(result.isError).toBe(false)
}

async function preservesCapture(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.result = { ...COMPUTER_CANCELLATION_COMPLETED, capture: COMPUTER_CANCELLATION_CAPTURE }
  sut.computer.abortOnExecute = sut.controller
  const result = await sut.handler.execute("call", { action: "click" }, sut.controller.signal, undefined, sut.context)
  expect(result.details?.result).toEqual(sut.computer.result)
  expect(JSON.stringify(result.content)).toContain(COMPUTER_CANCELLATION_CAPTURE.summary)
}

async function refusalIsError(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.result = COMPUTER_CANCELLATION_REFUSED
  const result = await sut.handler.execute(
    "call",
    { action: "key", keys: "unsafe" },
    sut.controller.signal,
    undefined,
    sut.context,
  )
  expect(result.isError).toBe(true)
  expect(result.details?.result).toEqual(COMPUTER_CANCELLATION_REFUSED)
}

async function failureIsError(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.result = COMPUTER_CANCELLATION_FAILED
  const result = await sut.handler.execute("call", { action: "click" }, sut.controller.signal, undefined, sut.context)
  expect(result.isError).toBe(true)
}

async function invalidDoesNotExecute(): Promise<void> {
  const sut = computerCancellationSut()
  const result = await sut.handler.execute("call", { action: "type" }, sut.controller.signal, undefined, sut.context)
  expect(result.isError).toBe(true)
  expect(sut.computer.calls).toBe(0)
}

async function cancelledCoreIsError(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.result = COMPUTER_CANCELLATION_CANCELLED
  const result = await sut.handler.execute("call", { action: "click" }, sut.controller.signal, undefined, sut.context)
  expect(result.isError).toBe(true)
  expect(result.details?.result).toEqual(COMPUTER_CANCELLATION_CANCELLED)
}

async function preservesCaptureFailure(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.result = { ...COMPUTER_CANCELLATION_COMPLETED, captureFailure: COMPUTER_CANCELLATION_CAPTURE_FAILURE }
  sut.computer.abortOnExecute = sut.controller
  const result = await sut.handler.execute("call", { action: "click" }, sut.controller.signal, undefined, sut.context)
  expect(result.details?.result).toEqual(sut.computer.result)
  expect(JSON.stringify(result.content)).toContain(COMPUTER_CANCELLATION_CAPTURE_FAILURE)
}

async function preservesPrecedingEffects(): Promise<void> {
  const sut = computerCancellationSut()
  sut.computer.result = COMPUTER_CANCELLATION_PRECEDING_EFFECTS
  sut.computer.abortOnExecute = sut.controller
  const result = await sut.handler.execute("call", { action: "click" }, sut.controller.signal, undefined, sut.context)
  expect(result.details?.result).toEqual(COMPUTER_CANCELLATION_PRECEDING_EFFECTS)
  expect(result.isError).toBe(true)
}

function suite(): void {
  test("efeito de foco anterior não é confundido com click concluído", preservesPrecedingEffects)
  test("cancelamento explícito do núcleo é erro", cancelledCoreIsError)
  test("falha captura pós-efeito preserva confirmação e motivo", preservesCaptureFailure)
  test("pré-cancelamento não executa", refusesPreAborted)
  test("encaminha sinal ao núcleo", forwardsSignal)
  test("cancelamento posterior preserva efeito confirmado", preservesCompleted)
  test("cancelamento posterior preserva resultado incerto", preservesUnknown)
  test("cancelamento posterior preserva captura e veredito", preservesCapture)
  test("recusa é erro da ferramenta", refusalIsError)
  test("falha é erro da ferramenta", failureIsError)
  test("argumento incompleto não executa", invalidDoesNotExecute)
}

describe("cancelamento e resultado da ponte computer-use", suite)
