import { afterEach, describe, expect, test } from "vitest"
import { callModel } from "#synapse/client"
import { ModelError } from "#synapse/errors"
import { type Settings } from "#synapse/settings"
import { MESSAGES, type StubReply, StubServer, sseOf } from "#synapse/tests/client"
import { SETTINGS } from "#synapse/tests/fixtures"

const stubs: StubServer[] = []

async function settingsFor(replies: StubReply[]): Promise<Settings> {
  const stub = new StubServer(replies)
  stubs.push(stub)
  return { ...SETTINGS, baseUrl: await stub.start() }
}

afterEach(async () => {
  await Promise.all(stubs.splice(0).map((stub) => stub.stop()))
})

describe("callModel", () => {
  test("joins the streamed pieces and trims the text", async () => {
    const settings = await settingsFor([{ status: 200, body: sseOf("  res", "posta  ") }])
    expect(await callModel(settings, MESSAGES)).toBe("resposta")
  })

  test("sends a streaming request", async () => {
    const settings = await settingsFor([{ status: 200, body: sseOf("ok") }])
    await callModel(settings, MESSAGES)
    expect(stubs.at(0)?.bodies.at(0)).toContain('"stream":true')
  })

  test("rejects an empty stream", async () => {
    const settings = await settingsFor([{ status: 200, body: sseOf("   ") }])
    await expect(callModel(settings, MESSAGES)).rejects.toThrow(ModelError)
  })

  test("rejects an event that is not a chat chunk", async () => {
    const settings = await settingsFor([{ status: 200, body: 'data: {"error": "x"}\n\n' }])
    await expect(callModel(settings, MESSAGES)).rejects.toThrow(ModelError)
  })

  test("does not retry a client error", async () => {
    const settings = await settingsFor([{ status: 401, body: "" }])
    await expect(callModel(settings, MESSAGES)).rejects.toThrow("HTTP 401")
    expect(stubs.at(0)?.requests.length).toBe(1)
  })
})
