import { setTimeout as wait } from "node:timers/promises"
import { describe, expect, test } from "vitest"
import { IphoneSessionQueue } from "#synapse/modules/iphone/internal/session-lifecycle"
import { type IphoneSessionPort } from "#synapse/modules/iphone/public/contracts"
import { TestIphoneFactory } from "./doubles"
import { type IphoneSessionTestSut } from "./types"

function makeSut(): IphoneSessionTestSut {
  const factory = new TestIphoneFactory()
  return { factory, queue: new IphoneSessionQueue(factory) }
}

async function operation(session: IphoneSessionPort, signal: AbortSignal): Promise<IphoneSessionPort> {
  signal.throwIfAborted()
  return session
}

async function reuse(): Promise<void> {
  const sut = makeSut()
  const signal = new AbortController().signal
  await sut.queue.execute(operation, signal)
  await sut.queue.execute(operation, signal)
  expect(sut.factory.creates).toBe(1)
  expect(sut.factory.session.probes).toBe(1)
}

async function recreate(): Promise<void> {
  const sut = makeSut()
  const signal = new AbortController().signal
  await sut.queue.execute(operation, signal)
  sut.factory.session.failProbe = true
  await sut.queue.execute(operation, signal)
  expect(sut.factory.creates).toBe(2)
  expect(sut.factory.session.closes).toBe(1)
}

async function closed(): Promise<void> {
  const sut = makeSut()
  await sut.queue.shutdown()
  await expect(sut.queue.execute(operation, new AbortController().signal)).rejects.toThrow()
  expect(sut.factory.stops).toBe(1)
}

async function idempotentShutdown(): Promise<void> {
  const sut = makeSut()
  const signal = new AbortController().signal
  await sut.queue.execute(operation, signal)
  const first = sut.queue.shutdown()
  const second = sut.queue.shutdown()
  expect(first).toBe(second)
  await first
  expect(sut.factory.stops).toBe(1)
  expect(sut.factory.session.closes).toBe(1)
}

async function cancellation(): Promise<void> {
  const sut = makeSut()
  const controller = new AbortController()
  controller.abort()
  await expect(sut.queue.execute(operation, controller.signal)).rejects.toThrow()
  expect(sut.factory.creates).toBe(0)
}

async function abortOnShutdown(): Promise<void> {
  const sut = makeSut()
  const pending = sut.queue.execute(waitForAbort, new AbortController().signal)
  await wait(0)
  const shutdown = sut.queue.shutdown()
  await expect(pending).rejects.toThrow()
  await shutdown
  expect(sut.factory.stops).toBe(1)
}

async function waitForAbort(_session: IphoneSessionPort, signal: AbortSignal): Promise<IphoneSessionPort> {
  await wait(60000, null, { signal })
  return _session
}

function suite(): void {
  test("encerra uma vez", idempotentShutdown)
  test("interrompe operação no encerramento", abortOnShutdown)
  test("reutiliza sessão", reuse)
  test("recria após falha na sonda", recreate)
  test("recusa após encerramento", closed)
  test("cancelamento não cria sessão", cancellation)
}

describe("sessão iPhone", suite)
