import { afterEach, expect, test, vi } from "vitest"
import { callModel } from "./call-model"

const SETTINGS = { apiKey: "chave", baseUrl: "http://modelo.invalido", model: "modelo" }

function stream(finishReason: string): string {
  const finish = finishReason.length > 0 ? `"${finishReason}"` : "null"
  return [`data: {"choices":[{"delta":{"content":"{}"},"finish_reason":${finish}}]}`, "", "data: [DONE]", ""].join("\n")
}

function stubFetch(response: Response): void {
  vi.stubGlobal("fetch", async () => response)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

test("aceita a resposta que termina com stop", async () => {
  stubFetch(new Response(stream("stop")))
  await expect(callModel(SETTINGS, "prompt")).resolves.toBe("{}")
})

test("rejeita a resposta cortada pelo limite de tokens", async () => {
  stubFetch(new Response(stream("length")))
  await expect(callModel(SETTINGS, "prompt")).rejects.toThrow(/não terminou normalmente/)
})

test("rejeita o fluxo que acaba sem motivo de término", async () => {
  stubFetch(new Response(stream("")))
  await expect(callModel(SETTINGS, "prompt")).rejects.toThrow(/não terminou normalmente/)
})

test("não repete a chamada quando o modelo recusa a chave", async () => {
  const fetchStub = vi.fn(async () => new Response('{"error":{"message":"negado"}}', { status: 403 }))
  vi.stubGlobal("fetch", fetchStub)
  await expect(callModel(SETTINGS, "prompt")).rejects.toThrow(/403/)
  expect(fetchStub).toHaveBeenCalledTimes(1)
})
