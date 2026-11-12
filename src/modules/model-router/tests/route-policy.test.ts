import { describe, expect, test } from "vitest"
import { createModelRouter, type RouteRequest } from "../public"
import { RouterClassifierDouble, routerTestCandidate } from "./doubles"

function policyRequest(): RouteRequest {
  return {
    messages: [],
    candidates: [routerTestCandidate("cx/gpt-6.1-sol")],
  }
}

async function reserveOnFailure(): Promise<void> {
  const request = policyRequest()
  const classifier = new RouterClassifierDouble()
  classifier.failure = new Error("falha")
  expect(await createModelRouter(classifier).route(request)).toMatchObject({
    kind: "reserve",
    modelId: "cx/gpt-6.1-sol",
    effort: "high",
  })
}

async function rejectUnauthorizedReserve(): Promise<void> {
  const request = policyRequest()
  for (const model of request.candidates) {
    model.authorized = false
  }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toMatchObject({ kind: "unavailable" })
}

async function keepRetry(): Promise<void> {
  const request = policyRequest()
  request.reason = "retry"
  request.failed = { provider: "omniroute", efforts: ["low", "high"], modelId: "failed", effort: "low" }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toEqual({
    kind: "kept",
    provider: "omniroute",
    modelId: "failed",
    effort: "low",
  })
}

async function keepContinuation(): Promise<void> {
  const request = policyRequest()
  request.reason = "continuation"
  request.previous = { provider: "omniroute", efforts: ["medium", "high"], modelId: "previous", effort: "medium" }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toEqual({
    kind: "kept",
    provider: "omniroute",
    modelId: "previous",
    effort: "medium",
  })
}

async function rejectWrongProvider(): Promise<void> {
  const request = policyRequest()
  for (const model of request.candidates) {
    model.provider = "other"
  }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toMatchObject({ kind: "unavailable" })
}

async function rejectTextOnly(): Promise<void> {
  const request = policyRequest()
  for (const model of request.candidates) {
    model.input = ["text"]
    model.id = "other"
  }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toMatchObject({ kind: "unavailable" })
}

async function rejectUnsupportedReserve(): Promise<void> {
  const request = policyRequest()
  for (const model of request.candidates) {
    model.input = ["text"]
    model.efforts = ["low"]
  }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toMatchObject({ kind: "unavailable" })
}

async function normalizeLegacyPair(): Promise<void> {
  const request = policyRequest()
  request.reason = "continuation"
  request.previous = { provider: "omniroute", modelId: "legacy", efforts: ["low", "medium"] }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toEqual({
    kind: "kept",
    provider: "omniroute",
    modelId: "legacy",
    effort: "medium",
  })
}

async function rejectLegacyWithoutEffort(): Promise<void> {
  const request = policyRequest()
  request.reason = "continuation"
  request.previous = { provider: "omniroute", modelId: "legacy", efforts: [] }
  expect(await createModelRouter(new RouterClassifierDouble()).route(request)).toMatchObject({
    kind: "unavailable",
    reason: expect.stringContaining("par físico anterior"),
  })
}

function registerTests(): void {
  test("par legado sem níveis devolve indisponível", rejectLegacyWithoutEffort)
  test("par legado sem esforço segue preferência entre níveis suportados", normalizeLegacyPair)
  test("falha técnica usa reserva", reserveOnFailure)
  test("recusa reserva sem credencial", rejectUnauthorizedReserve)
  test("mantém par na repetição", keepRetry)
  test("mantém par na continuação", keepContinuation)
  test("recusa outro provedor", rejectWrongProvider)
  test("recusa modelo sem imagem", rejectTextOnly)
  test("recusa reserva sem high", rejectUnsupportedReserve)
}

describe("política de roteamento", registerTests)
