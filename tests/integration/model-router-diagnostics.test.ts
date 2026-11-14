import { describe, expect, test } from "vitest"
import {
  makeRouterIntegrationSut,
  ROUTER_TEST_DIAGNOSTICS_SUITE,
  ROUTER_TEST_FALLBACK,
  ROUTER_TEST_FALLBACK_PATTERN,
  ROUTER_TEST_HIGH,
  ROUTER_TEST_HTTP_DIAGNOSTIC_TITLE,
  ROUTER_TEST_HTTP_ERROR,
  ROUTER_TEST_INVALID_CLASSIFICATION_REASON,
  ROUTER_TEST_MALFORMED_DIAGNOSTIC_TITLE,
  ROUTER_TEST_PROVIDER_DIAGNOSTIC_TITLE,
  ROUTER_TEST_PROVIDER_FALLBACK_REASON,
  ROUTER_TEST_PROVIDER_NOT_CONFIGURED,
  ROUTER_TEST_SECOND,
  ROUTER_TEST_SENSITIVE_DIAGNOSTIC_TITLE,
  ROUTER_TEST_SENSITIVE_PROVIDER_ERROR,
  ROUTER_TEST_STALE_ERROR_TITLE,
} from "../fixtures"

async function providerNotConfigured(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.classifierFails = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_PROVIDER_NOT_CONFIGURED
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe(ROUTER_TEST_FALLBACK)
  expect(result.thinkingLevel).toBe(ROUTER_TEST_HIGH)
  expect(result.state?.reason).toBe(ROUTER_TEST_PROVIDER_FALLBACK_REASON)
}

async function rejectSensitiveProviderError(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.classifierFails = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_SENSITIVE_PROVIDER_ERROR
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe(ROUTER_TEST_FALLBACK)
  expect(result.thinkingLevel).toBe(ROUTER_TEST_HIGH)
  expect(result.state?.reason).toBe(ROUTER_TEST_INVALID_CLASSIFICATION_REASON)
}

async function rejectHttpErrorBody(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.classifierFails = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_HTTP_ERROR
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe(ROUTER_TEST_FALLBACK)
  expect(result.thinkingLevel).toBe(ROUTER_TEST_HIGH)
  expect(result.state?.reason).toBe(ROUTER_TEST_INVALID_CLASSIFICATION_REASON)
}

async function rejectMalformedAnswer(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.omitAnswers = true
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_PROVIDER_NOT_CONFIGURED
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe(ROUTER_TEST_FALLBACK)
  expect(result.thinkingLevel).toBe(ROUTER_TEST_HIGH)
  expect(result.state?.reason).toBe(ROUTER_TEST_INVALID_CLASSIFICATION_REASON)
}

async function successfulResponseWithStaleError(): Promise<void> {
  const sut = makeRouterIntegrationSut()
  sut.context.modelRegistry.errorMessage = ROUTER_TEST_PROVIDER_NOT_CONFIGURED
  const result = await sut.host.requireModel().route(sut.request, sut.context)
  expect(result.model.id).toBe(ROUTER_TEST_SECOND)
  expect(result.thinkingLevel).toBe(ROUTER_TEST_HIGH)
  expect(result.state?.reason).not.toMatch(ROUTER_TEST_FALLBACK_PATTERN)
}

function registerTests(): void {
  test(ROUTER_TEST_PROVIDER_DIAGNOSTIC_TITLE, providerNotConfigured)
  test(ROUTER_TEST_SENSITIVE_DIAGNOSTIC_TITLE, rejectSensitiveProviderError)
  test(ROUTER_TEST_HTTP_DIAGNOSTIC_TITLE, rejectHttpErrorBody)
  test(ROUTER_TEST_MALFORMED_DIAGNOSTIC_TITLE, rejectMalformedAnswer)
  test(ROUTER_TEST_STALE_ERROR_TITLE, successfulResponseWithStaleError)
}

describe(ROUTER_TEST_DIAGNOSTICS_SUITE, registerTests)
