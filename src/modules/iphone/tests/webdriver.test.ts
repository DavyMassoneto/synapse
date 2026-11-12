import { describe, expect, test } from "vitest"
import {
  createIphoneWebDriverSession,
  IPHONE_HTTP_SESSION_TIMEOUT_MS,
  IPHONE_HTTP_TIMEOUT_MS,
} from "#synapse/modules/iphone/adapters/webdriver-http"
import { executeIphoneDeviceAction } from "#synapse/modules/iphone/internal/device-actions"
import { buildIphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import { TestIphoneHttpServer } from "./doubles"

function makeCapabilities() {
  return buildIphoneCapabilities(
    {
      serverUrl: "http://localhost:4723",
      target: { kind: "device", udid: "test", deviceName: "test", wdaInstalled: true },
    },
    "darwin",
  )
}

async function createsSession(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)
    expect(session.id).toBe("test-session")
  } finally {
    await server.stop()
  }
}

async function rejectsInvalidResponse(): Promise<void> {
  const server = new TestIphoneHttpServer()
  server.response = '{"value":{"sessionId":4}}'
  const base = await server.start()
  try {
    await expect(createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)).rejects.toThrow()
  } finally {
    await server.stop()
  }
}

async function parsesWebdriverFailure(): Promise<void> {
  const server = new TestIphoneHttpServer()
  server.status = 500
  server.response = '{"value":{"error":"unknown command","message":"não suportado"}}'
  const base = await server.start()
  try {
    await expect(
      createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal),
    ).rejects.toMatchObject({ code: "unknown command" })
    expect(server.requests).toBe(1)
  } finally {
    await server.stop()
  }
}

async function readsSource(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)
    server.response = '{"value":"<root/>"}'
    expect(await session.source(new AbortController().signal)).toBe("<root/>")
    expect(server.paths).toContain("/session/test-session/source")
  } finally {
    await server.stop()
  }
}

async function unsupportedFallback(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)
    server.statuses = [500, 200, 200]
    server.responses = [
      '{"value":{"error":"unsupported operation","message":"indisponível"}}',
      '{"value":{"element-6066-11e4-a52e-4f735466cecf":"el"}}',
      '{"value":null}',
    ]
    await executeIphoneDeviceAction(session, { kind: "type", text: "abc", submit: false }, new AbortController().signal)
    expect(server.paths).toEqual([
      "/session",
      "/session/test-session/execute/sync",
      "/session/test-session/element/active",
      "/session/test-session/element/el/value",
    ])
  } finally {
    await server.stop()
  }
}

async function uncertainDoesNotRepeat(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)
    server.status = 500
    server.response = '{"value":{"error":"timeout","message":"incerto"}}'
    await expect(
      executeIphoneDeviceAction(session, { kind: "type", text: "abc", submit: false }, new AbortController().signal),
    ).rejects.toThrow()
    expect(server.paths).toHaveLength(2)
  } finally {
    await server.stop()
  }
}

async function acceptsBooleanMobileResult(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)
    server.response = '{"value":true}'
    await expect(
      session.mobile("terminateApp", { bundleId: "fake" }, new AbortController().signal),
    ).resolves.toBeUndefined()
  } finally {
    await server.stop()
  }
}

async function acceptsObjectMobileResult(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)
    server.response = '{"value":{"pid":123}}'
    await expect(
      session.mobile("launchApp", { bundleId: "fake" }, new AbortController().signal),
    ).resolves.toBeUndefined()
  } finally {
    await server.stop()
  }
}

async function rejectsWrongMobileResult(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  try {
    const session = await createIphoneWebDriverSession(base, makeCapabilities(), new AbortController().signal)
    server.response = '{"value":"incorrect"}'
    await expect(session.mobile("terminateApp", { bundleId: "fake" }, new AbortController().signal)).rejects.toThrow()
  } finally {
    await server.stop()
  }
}

async function cancelsFetch(): Promise<void> {
  const server = new TestIphoneHttpServer()
  server.delayMs = 200
  const base = await server.start()
  try {
    const controller = new AbortController()
    const pending = createIphoneWebDriverSession(base, makeCapabilities(), controller.signal)
    setTimeout(controller.abort.bind(controller), 30)
    await expect(pending).rejects.toThrow()
    expect(server.requests).toBeLessThanOrEqual(1)
  } finally {
    await server.stop()
  }
}

function sessionBuildHasLongTimeout(): void {
  expect(IPHONE_HTTP_SESSION_TIMEOUT_MS).toBeGreaterThan(IPHONE_HTTP_TIMEOUT_MS)
  expect(IPHONE_HTTP_SESSION_TIMEOUT_MS).toBe(900000)
}

function suite(): void {
  test("reserva tempo para compilar WDA", sessionBuildHasLongTimeout)
  test("aceita objeto de launch", acceptsObjectMobileResult)
  test("aceita booleano de terminate", acceptsBooleanMobileResult)
  test("recusa retorno inválido de terminate", rejectsWrongMobileResult)
  test("cancela requisição em andamento", cancelsFetch)
  test("usa alternativa somente se não suportado", unsupportedFallback)
  test("não repete efeito incerto", uncertainDoesNotRepeat)
  test("lê árvore via servidor falso", readsSource)
  test("interpreta erro W3C sem repetir", parsesWebdriverFailure)
  test("cria sessão via servidor falso", createsSession)
  test("recusa resposta inválida", rejectsInvalidResponse)
}

describe("WebDriver HTTP", suite)
