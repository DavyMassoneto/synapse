import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import {
  createIphone,
  type IphoneModuleDependencies,
  type IphoneSimulatorCommandOutput,
} from "#synapse/modules/iphone/public"
import { TestIphoneHttpServer } from "./doubles"

async function noSimulators(): Promise<IphoneSimulatorCommandOutput> {
  return { stdout: '{"devices":{}}', stderr: "" }
}

function makeSut(base: string, directory: string): IphoneModuleDependencies {
  const configPath = join(directory, "config.json")
  writeFileSync(
    configPath,
    JSON.stringify({
      serverUrl: base,
      target: { kind: "device", deviceName: "fake", udid: "fake", wdaInstalled: true },
    }),
  )
  return { host: "darwin", configPath, stateDirectory: directory, path: "", executeSimulatorCommand: noSimulators }
}

async function lazySession(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut(base, directory))
    expect(server.requests).toBe(0)
    server.responses = [
      '{"value":null}',
      '{"value":{"sessionId":"test-session"}}',
      '{"value":"<root/>"}',
      '{"value":{"x":0,"y":0,"width":440,"height":956}}',
      '{"value":null}',
    ]
    await module.execute({ kind: "tree", max: 20 }, new AbortController().signal)
    await module.shutdown()
    expect(server.paths).toEqual([
      "/status",
      "/session",
      "/session/test-session/source",
      "/session/test-session/window/rect",
      "/session/test-session",
    ])
  } finally {
    await server.stop()
    rmSync(directory, { recursive: true, force: true })
  }
}

async function reusesSession(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut(base, directory))
    server.responses = [
      '{"value":null}',
      '{"value":{"sessionId":"test-session"}}',
      '{"value":"<root/>"}',
      '{"value":{"x":0,"y":0,"width":440,"height":956}}',
      '{"value":{"x":0,"y":0,"width":440,"height":956}}',
      '{"value":"<root/>"}',
      '{"value":{"x":0,"y":0,"width":440,"height":956}}',
      '{"value":null}',
    ]
    await module.execute({ kind: "tree", max: 20 }, new AbortController().signal)
    await module.execute({ kind: "tree", max: 20 }, new AbortController().signal)
    await module.shutdown()
    expect(server.paths.filter((path) => path === "/session")).toHaveLength(1)
  } finally {
    await server.stop()
    rmSync(directory, { recursive: true, force: true })
  }
}

async function readsHome(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut(base, directory))
    server.responses = [
      '{"value":null}',
      '{"value":{"sessionId":"test-session"}}',
      '{"value":{"x":0,"y":0,"width":440,"height":956}}',
      '{"value":"<root/>"}',
      '{"value":null}',
    ]
    const result = await module.home({ kind: "read" }, new AbortController().signal)
    expect(result.kind).toBe("accepted")
    await module.shutdown()
  } finally {
    await server.stop()
    rmSync(directory, { recursive: true, force: true })
  }
}

async function closesSessionOnce(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut(base, directory))
    server.responses = ['{"value":null}', '{"value":{"sessionId":"test-session"}}', '{"value":null}']
    await module.execute({ kind: "close" }, new AbortController().signal)
    await module.shutdown()
    expect(server.paths.filter((path) => path === "/session/test-session")).toHaveLength(1)
  } finally {
    await server.stop()
    rmSync(directory, { recursive: true, force: true })
  }
}

async function selectsLastTreeElement(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut(base, directory))
    server.responses = [
      '{"value":null}',
      '{"value":{"sessionId":"test-session"}}',
      JSON.stringify({
        value: '<root><XCUIElementTypeButton label="Abrir" x="1" y="2" width="10" height="20"/></root>',
      }),
      '{"value":{"x":0,"y":0,"width":440,"height":956}}',
      '{"value":{"x":0,"y":0,"width":440,"height":956}}',
      '{"value":null}',
      '{"value":null}',
    ]
    const tree = await module.execute({ kind: "tree", max: 20 }, new AbortController().signal)
    expect(tree).toMatchObject({ kind: "tree", count: 1 })
    await module.executeTargeted(
      { action: { kind: "tap", point: { x: 0, y: 0 } }, target: { kind: "text", text: "abr" } },
      new AbortController().signal,
    )
    await module.shutdown()
    expect(server.paths).toContain("/session/test-session/actions")
  } finally {
    await server.stop()
    rmSync(directory, { recursive: true, force: true })
  }
}

async function readsConfigurationAndLog(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut("http://example.test", directory))
    expect(module.configuration().udid).toBe("fake")
    expect(module.log()).toMatchObject({ path: join(directory, "appium.log"), text: "" })
    await module.reset(new AbortController().signal)
    await module.shutdown()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

async function rejectsMissingElement(): Promise<void> {
  const server = new TestIphoneHttpServer()
  const base = await server.start()
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut(base, directory))
    server.responses = ['{"value":null}', '{"value":{"sessionId":"test-session"}}', '{"value":null}']
    await expect(
      module.executeTargeted(
        { action: { kind: "tap", point: { x: 0, y: 0 } }, target: { kind: "element", index: 99 } },
        new AbortController().signal,
      ),
    ).rejects.toThrow()
    await module.shutdown()
    expect(server.paths).not.toContain("/session/test-session/actions")
  } finally {
    await server.stop()
    rmSync(directory, { recursive: true, force: true })
  }
}

async function rejectsClosed(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), "iphone-module-"))
  try {
    const module = createIphone(makeSut("http://example.test", directory))
    await module.shutdown()
    await expect(module.execute({ kind: "tree", max: 20 }, new AbortController().signal)).rejects.toThrow()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

function suite(): void {
  test("recusa índice ausente", rejectsMissingElement)
  test("lê configuração, log e reinicia sessão", readsConfigurationAndLog)
  test("resolve texto na última árvore", selectsLastTreeElement)
  test("fecha sessão uma vez", closesSessionOnce)
  test("lê tela inicial", readsHome)
  test("reutiliza sessão após sonda", reusesSession)
  test("cria sessão sob demanda", lazySession)
  test("recusa após encerrar", rejectsClosed)
}

describe("montagem iPhone", suite)
