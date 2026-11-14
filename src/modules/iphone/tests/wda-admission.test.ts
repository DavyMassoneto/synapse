import { once } from "node:events"
import { createConnection, createServer } from "node:net"
import { describe, expect, test } from "vitest"
import { IphoneWdaAdmission, type IphoneWdaAdmissions } from "#synapse/modules/iphone/adapters/wda-admission"
import { closeWdaTest, freeWdaTestPort, listenWdaTest } from "./wda-support"

async function ownsPortUntilRelease(): Promise<void> {
  const port = await freeWdaTestPort()
  const owners: IphoneWdaAdmissions = new Set()
  const first = new IphoneWdaAdmission(port, owners)
  const second = new IphoneWdaAdmission(port, owners)
  const next = new IphoneWdaAdmission(port, owners)
  const signal = new AbortController().signal
  try {
    await first.reserve(signal)
    await first.handoff(signal)
    await expect(second.reserve(signal)).rejects.toThrow()
    await second.release()
    await expect(second.reserve(signal)).rejects.toThrow()
    await first.release()
    await next.reserve(signal)
    await first.release()
    await expect(new IphoneWdaAdmission(port, owners).reserve(signal)).rejects.toThrow()
    expect(owners.size).toBe(1)
  } finally {
    await first.release()
    await second.release()
    await next.release()
  }
}

async function releasesPartialBind(): Promise<void> {
  const foreign = createServer()
  const port = await listenWdaTest(foreign, "::1", 0)
  const owners: IphoneWdaAdmissions = new Set()
  const admission = new IphoneWdaAdmission(port, owners)
  const check = createServer()
  try {
    await expect(admission.reserve(new AbortController().signal)).rejects.toThrow()
    expect(owners.size).toBe(0)
    await listenWdaTest(check, "127.0.0.1", port)
  } finally {
    await closeWdaTest(check)
    await closeWdaTest(foreign)
    await admission.release()
  }
}

async function releasesAfterAbort(): Promise<void> {
  const port = await freeWdaTestPort()
  const owners: IphoneWdaAdmissions = new Set()
  const admission = new IphoneWdaAdmission(port, owners)
  const controller = new AbortController()
  try {
    const pending = admission.reserve(controller.signal)
    controller.abort()
    await expect(pending).rejects.toThrow()
    expect(owners.size).toBe(0)
    const next = new IphoneWdaAdmission(port, owners)
    await next.reserve(new AbortController().signal)
    await next.release()
  } finally {
    await admission.release()
  }
}

async function releasesPendingBind(): Promise<void> {
  const port = await freeWdaTestPort()
  const owners: IphoneWdaAdmissions = new Set()
  const admission = new IphoneWdaAdmission(port, owners)
  const reserving = admission.reserve(new AbortController().signal)
  const rejected = expect(reserving).rejects.toThrow()
  await admission.release()
  await rejected
  expect(owners.size).toBe(0)
  const next = new IphoneWdaAdmission(port, owners)
  await next.reserve(new AbortController().signal)
  await next.release()
}

function observesReset(error: Error): void {
  expect(error.message).toContain("ECONNRESET")
}

async function destroysIdleConnection(): Promise<void> {
  const port = await freeWdaTestPort()
  const owners: IphoneWdaAdmissions = new Set()
  const admission = new IphoneWdaAdmission(port, owners)
  const signal = new AbortController().signal
  await admission.reserve(signal)
  const client = createConnection({ host: "127.0.0.1", port })
  const connected = once(client, "connect")
  const disconnected = Promise.withResolvers<void>()
  client.once("error", observesReset)
  client.once("close", disconnected.resolve)
  await connected
  await admission.handoff(signal)
  await disconnected.promise
  await admission.release()
  expect(owners.size).toBe(0)
}

async function cancelsAfterHandoff(): Promise<void> {
  const port = await freeWdaTestPort()
  const owners: IphoneWdaAdmissions = new Set()
  const admission = new IphoneWdaAdmission(port, owners)
  const signal = new AbortController().signal
  await admission.reserve(signal)
  await admission.handoff(signal)
  await admission.release()
  expect(admission.signal.aborted).toBe(true)
  await expect(admission.handoff(signal)).rejects.toThrow()
  const next = new IphoneWdaAdmission(port, owners)
  await next.reserve(signal)
  await admission.release()
  expect(owners.size).toBe(1)
  await next.release()
}

function suite(): void {
  test("stop após handoff cancela criação antiga sem liberar a próxima", cancelsAfterHandoff)
  test("release enquanto listen pendente fecha socket tardio", releasesPendingBind)
  test("TCP ocioso é destruído sem bloquear handoff", destroysIdleConnection)
  test("retém exclusão após handoff e não libera reserva alheia", ownsPortUntilRelease)
  test("falha IPv6 fecha bind IPv4 e libera reserva", releasesPartialBind)
  test("abort durante bind libera sockets e reserva", releasesAfterAbort)
}

describe("admissão WDA", suite)
