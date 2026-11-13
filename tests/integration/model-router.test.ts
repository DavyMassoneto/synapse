import { describe, expect, test } from "vitest"
import { registerModelRouter } from "#synapse/integration"
import { createModelRouter } from "#synapse/modules"
import {
  fixtureModel,
  imageModel,
  ROUTER_TEST_ABORT_ERROR,
  ROUTER_TEST_ABORTED_REASON,
  ROUTER_TEST_ASSISTANT,
  ROUTER_TEST_CONTEXT_WINDOW,
  ROUTER_TEST_CONTINUATION,
  ROUTER_TEST_ERROR,
  ROUTER_TEST_FAILED,
  ROUTER_TEST_FAILURE_MESSAGE,
  ROUTER_TEST_FALLBACK_PATTERN,
  ROUTER_TEST_HIGH,
  ROUTER_TEST_IMAGE_MODEL,
  ROUTER_TEST_INVESTIGATION,
  ROUTER_TEST_LOW,
  ROUTER_TEST_MEDIUM,
  ROUTER_TEST_OTHER_PROVIDER,
  ROUTER_TEST_PREVIOUS,
  ROUTER_TEST_PROVIDER,
  ROUTER_TEST_RETRY,
  ROUTER_TEST_TEXT_ONLY,
  ROUTER_TEST_UNAVAILABLE_FALLBACK,
  ROUTER_TEST_UNAVAILABLE_SELECTION,
  ROUTER_TEST_USER,
  ROUTER_TEST_VIRTUAL_ID,
  ROUTER_TEST_VIRTUAL_PROVIDER,
  RouterFixtureHost,
  RouterFixtureRegistry,
  type RouterIntegrationSut,
  TEST_USAGE,
  TestUI,
} from "../fixtures"

function makeSut(): RouterIntegrationSut {
  const host = new RouterFixtureHost()
  registerModelRouter(host, createModelRouter)
  return {
    host,
    context: { modelRegistry: new RouterFixtureRegistry(), hasUI: false, ui: new TestUI() },
    request: {
      model: fixtureModel(ROUTER_TEST_VIRTUAL_PROVIDER, ROUTER_TEST_VIRTUAL_ID, ROUTER_TEST_CONTEXT_WINDOW),
      thinkingLevel: ROUTER_TEST_HIGH,
      reason: ROUTER_TEST_USER,
      messages: [{ role: ROUTER_TEST_USER, content: ROUTER_TEST_INVESTIGATION, timestamp: 0 }],
    },
  }
}

async function appliedSelection(): Promise<void> {
  const sut = makeSut()
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe("second")
  expect(result.thinkingLevel).toBe("high")
  expect(sut.context.modelRegistry.calls).toBe(2)
}

async function retryPair(): Promise<void> {
  const sut = makeSut()
  const model = fixtureModel(ROUTER_TEST_PROVIDER, ROUTER_TEST_FAILED, ROUTER_TEST_CONTEXT_WINDOW)
  sut.context.modelRegistry.models.push(model)
  sut.request.reason = ROUTER_TEST_RETRY
  sut.request.failed = {
    model,
    thinkingLevel: ROUTER_TEST_LOW,
    message: {
      role: ROUTER_TEST_ASSISTANT,
      content: [],
      api: model.api,
      provider: model.provider,
      model: model.id,
      stopReason: ROUTER_TEST_ERROR,
      errorMessage: ROUTER_TEST_FAILURE_MESSAGE,
      timestamp: 0,
      usage: TEST_USAGE,
    },
  }
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model).toBe(model)
  expect(result.thinkingLevel).toBe("low")
  expect(sut.context.modelRegistry.calls).toBe(0)
}

async function continuationPair(): Promise<void> {
  const sut = makeSut()
  const model = fixtureModel(ROUTER_TEST_PROVIDER, ROUTER_TEST_PREVIOUS, ROUTER_TEST_CONTEXT_WINDOW)
  sut.context.modelRegistry.models.push(model)
  sut.request.reason = ROUTER_TEST_CONTINUATION
  sut.request.previous = { model, thinkingLevel: ROUTER_TEST_MEDIUM }
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model).toBe(model)
  expect(result.thinkingLevel).toBe("medium")
  expect(sut.context.modelRegistry.calls).toBe(0)
}

async function classificationFallback(): Promise<void> {
  const sut = makeSut()
  sut.context.modelRegistry.classifierFails = true
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe("cx/gpt-6.1-sol")
  expect(result.thinkingLevel).toBe("high")
  expect(result.state?.reason).toMatch(ROUTER_TEST_FALLBACK_PATTERN)
}

async function missingFallback(): Promise<void> {
  const sut = makeSut()
  sut.context.modelRegistry.classifierFails = true
  sut.context.modelRegistry.models = sut.context.modelRegistry.models.slice(0, 2)
  await expect(sut.host.requireModel().route(sut.request, sut.context)).rejects.toThrow(
    ROUTER_TEST_UNAVAILABLE_FALLBACK,
  )
}

async function missingCandidates(): Promise<void> {
  const sut = makeSut()
  sut.context.modelRegistry.models = []
  await expect(sut.host.requireModel().route(sut.request, sut.context)).rejects.toThrow(
    ROUTER_TEST_UNAVAILABLE_FALLBACK,
  )
  expect(sut.context.modelRegistry.calls).toBe(0)
}

async function revokedCredentials(): Promise<void> {
  const sut = makeSut()
  sut.context.modelRegistry.revokeOnClassify = true
  sut.context.modelRegistry.models = sut.context.modelRegistry.models.slice(0, 2)
  await expect(sut.host.requireModel().route(sut.request, sut.context)).rejects.toThrow(
    ROUTER_TEST_UNAVAILABLE_SELECTION,
  )
}

async function cancelledRoute(): Promise<void> {
  const sut = makeSut()
  sut.request.signal = AbortSignal.abort()
  await expect(sut.host.requireModel().route(sut.request, sut.context)).rejects.toMatchObject({
    name: ROUTER_TEST_ABORT_ERROR,
  })
  expect(sut.context.modelRegistry.calls).toBe(0)
}

async function rejectIneligibleCandidates(): Promise<void> {
  const sut = makeSut()
  sut.context.modelRegistry.models = [
    fixtureModel(ROUTER_TEST_PROVIDER, ROUTER_TEST_TEXT_ONLY, ROUTER_TEST_CONTEXT_WINDOW),
    imageModel(ROUTER_TEST_OTHER_PROVIDER, ROUTER_TEST_IMAGE_MODEL),
  ]
  await expect(sut.host.requireModel().route(sut.request, sut.context)).rejects.toThrow(
    ROUTER_TEST_UNAVAILABLE_FALLBACK,
  )
  expect(sut.context.modelRegistry.calls).toBe(0)
}

async function rejectUnauthenticatedCandidates(): Promise<void> {
  const sut = makeSut()
  for (const model of sut.context.modelRegistry.models) {
    sut.context.modelRegistry.unauthorized.add(model.id)
  }
  await expect(sut.host.requireModel().route(sut.request, sut.context)).rejects.toThrow(
    ROUTER_TEST_UNAVAILABLE_FALLBACK,
  )
  expect(sut.context.modelRegistry.calls).toBe(0)
}

async function cancelledClassifierResponse(): Promise<void> {
  const sut = makeSut()
  sut.context.modelRegistry.stopReason = ROUTER_TEST_ABORTED_REASON
  await expect(sut.host.requireModel().route(sut.request, sut.context)).rejects.toMatchObject({
    name: ROUTER_TEST_ABORT_ERROR,
  })
  expect(sut.context.modelRegistry.calls).toBe(1)
}

function registerTests(): void {
  test("registra jev/auto e aplica seleção", appliedSelection)
  test("retry mantém o par que falhou", retryPair)
  test("continuação mantém o par anterior", continuationPair)
  test("falha técnica usa fallback Sol/high", classificationFallback)
  test("recusa falha técnica sem fallback", missingFallback)
  test("recusa catálogo sem candidatos", missingCandidates)
  test("recusa modelo que perdeu credencial", revokedCredentials)
  test("classificador abortado propaga cancelamento na ponte", cancelledClassifierResponse)
  test("cancelamento não usa fallback", cancelledRoute)
  test("recusa modelos sem imagem ou de outro provedor", rejectIneligibleCandidates)
  test("recusa candidatos sem credencial", rejectUnauthenticatedCandidates)
}

describe("integração model-router", registerTests)
