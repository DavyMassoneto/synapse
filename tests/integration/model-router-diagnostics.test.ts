import { describe, expect, test } from "vitest"
import {
  makeRouterIntegrationSut,
  ROUTER_TEST_FALLBACK_PATTERN,
  ROUTER_TEST_HTTP_ERROR,
  ROUTER_TEST_PROVIDER_NOT_CONFIGURED,
  ROUTER_TEST_SENSITIVE_PROVIDER_ERROR,
} from "../fixtures"

async function providerNotConfigured(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.classifierFails = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_PROVIDER_NOT_CONFIGURED
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe("cx/gpt-6.1-sol")
  expect(result.thinkingLevel).toBe("high")
  expect(result.state?.reason).toBe("Fallback técnico: Provider is not configured: typesafe")
}

async function rejectSensitiveProviderError(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.classifierFails = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_SENSITIVE_PROVIDER_ERROR
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe("cx/gpt-6.1-sol")
  expect(result.thinkingLevel).toBe("high")
  expect(result.state?.reason).toBe("Fallback técnico: Resposta de classificação Jev inválida.")
}

async function rejectHttpErrorBody(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.classifierFails = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_HTTP_ERROR
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe("cx/gpt-6.1-sol")
  expect(result.thinkingLevel).toBe("high")
  expect(result.state?.reason).toBe("Fallback técnico: Resposta de classificação Jev inválida.")
}

async function rejectMalformedAnswer(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.omitAnswers = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_PROVIDER_NOT_CONFIGURED
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe("cx/gpt-6.1-sol")
  expect(result.thinkingLevel).toBe("high")
  expect(result.state?.reason).toBe("Fallback técnico: Resposta de classificação Jev inválida.")
}

async function successfulResponseWithStaleError(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_PROVIDER_NOT_CONFIGURED
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe("second")
  expect(result.thinkingLevel).toBe("high")
  expect(result.state?.reason).not.toMatch(ROUTER_TEST_FALLBACK_PATTERN)
}

function registerTests(): void {
  test("provider ausente preserva diagnóstico e fallback Sol/high", providerNotConfigured)
  test("recusa diagnóstico com sufixo sensível", rejectSensitiveProviderError)
  test("não expõe corpo HTTP no diagnóstico", rejectHttpErrorBody)
  test("resposta malformada não é confundida com provider ausente", rejectMalformedAnswer)
  test("resposta válida ignora mensagem de erro residual", successfulResponseWithStaleError)
}

describe("diagnósticos do classificador model-router", registerTests)
