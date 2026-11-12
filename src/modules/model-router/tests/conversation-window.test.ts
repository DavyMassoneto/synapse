import { describe, expect, test } from "vitest"
import {
  boundRouterText,
  buildRouterConversation,
  ROUTER_CONTEXT_BYTES,
  ROUTER_MESSAGE_BYTES,
  ROUTER_OMISSION_MARKER,
} from "../internal"
import { type RouterHistoryEntry, type RouterMessage } from "../public"
import { ROUTER_UNIT_ASSISTANT, ROUTER_UNIT_USER } from "./constants"

function fitHistory(): void {
  const messages = Array.from({ length: 100 }, historyMessage)
  const state = buildRouterConversation(messages)
  const size = Buffer.byteLength(state.currentRequest) + state.history.reduce(historyBytes, 0)
  expect(size).toBeLessThanOrEqual(ROUTER_CONTEXT_BYTES)
  expect(state.omittedMessages).toBeGreaterThan(0)
  expect(state.history[0]?.content).toContain(ROUTER_OMISSION_MARKER)

  expect(state.history.map((entry) => entry.index)).toEqual(state.history.map((entry) => entry.index).sort(ascending))
}

function ascending(first: number, second: number): number {
  return first - second
}

function historyMessage(): RouterMessage {
  return { role: ROUTER_UNIT_ASSISTANT, text: "á".repeat(30000), image: false, calls: [] }
}

function historyBytes(total: number, entry: RouterHistoryEntry): number {
  return total + Buffer.byteLength(JSON.stringify(entry))
}

function redactCredentials(): void {
  const messages: RouterMessage[] = [
    {
      role: ROUTER_UNIT_USER,
      text: "password=hunter2 sk-abcdefghijklmnop ghp_abcdefghijklmnop op://vault/item/field\n-----BEGIN RSA PRIVATE KEY-----\nsecret\n-----END RSA PRIVATE KEY-----",
      image: false,
      calls: [],
    },
  ]
  const state = buildRouterConversation(messages)
  expect(state.currentRequest).not.toMatch(/hunter2|abcdefghijklmnop|vault\/item|BEGIN RSA/)
  expect(state.currentRequest).toContain("[credencial removida]")
}

function clipCurrent(): void {
  const messages: RouterMessage[] = [
    { role: ROUTER_UNIT_USER, text: `início${"😀".repeat(30000)}fim`, image: false, calls: [] },
  ]
  const state = buildRouterConversation(messages)
  expect(Buffer.byteLength(state.currentRequest)).toBeLessThanOrEqual(ROUTER_MESSAGE_BYTES)
  expect(state.currentRequest).toContain(ROUTER_OMISSION_MARKER)
  expect(state.currentRequest).toMatch(/^início/)
  expect(state.currentRequest).toMatch(/fim$/)
}

function missingUser(): void {
  const state = buildRouterConversation([])
  expect(state.currentIndex).toBeUndefined()
  expect(state.currentRequest).toContain("contexto sem pedido de usuário")
}

function clipsZeroCharacters(): void {
  const result = boundRouterText("x".repeat(1000), 120)
  expect(result).toBe(ROUTER_OMISSION_MARKER)
}

function registerTests(): void {
  test("corte com zero caracteres não preserva texto integral", clipsZeroCharacters)
  test("contexto sem usuário não inventa índice", missingUser)
  test("recusa excesso de histórico e marca cortes", fitHistory)
  test("remove credenciais antes de classificar", redactCredentials)
  test("corta pedido atual acima do limite", clipCurrent)
}

describe("janela de conversa model-router", registerTests)
