import { describe, expect, test } from "vitest"
import { registerCooldownRetry } from "#synapse/integration"
import {
  COOLING_DOWN_ERROR,
  CooldownRetryHostDouble,
  completedAssistantMessage,
  failedAssistantMessage,
  MODEL_COOLDOWN_ERROR,
  RATE_LIMIT_ERROR,
  REWRITE_PREFIX,
  UNRELATED_ERROR,
  userMessage,
} from "../fixtures"

function makeSut(): CooldownRetryHostDouble {
  const host = new CooldownRetryHostDouble()
  registerCooldownRetry(host)
  return host
}

function coolingDownRewritten(): void {
  const host = makeSut()
  const message = failedAssistantMessage(COOLING_DOWN_ERROR)
  expect(host.emitMessageEnd(message)).toStrictEqual({
    message: { ...message, errorMessage: `${REWRITE_PREFIX}${COOLING_DOWN_ERROR}` },
  })
}

function modelCooldownRewritten(): void {
  const host = makeSut()
  const message = failedAssistantMessage(MODEL_COOLDOWN_ERROR)
  expect(host.emitMessageEnd(message)).toStrictEqual({
    message: { ...message, errorMessage: `${REWRITE_PREFIX}${MODEL_COOLDOWN_ERROR}` },
  })
}

function rateLimitUntouched(): void {
  const host = makeSut()
  expect(host.emitMessageEnd(failedAssistantMessage(RATE_LIMIT_ERROR))).toStrictEqual({})
}

function unrelatedErrorUntouched(): void {
  const host = makeSut()
  expect(host.emitMessageEnd(failedAssistantMessage(UNRELATED_ERROR))).toStrictEqual({})
}

function completedAssistantUntouched(): void {
  const host = makeSut()
  expect(host.emitMessageEnd(completedAssistantMessage())).toStrictEqual({})
}

function userMessageUntouched(): void {
  const host = makeSut()
  expect(host.emitMessageEnd(userMessage())).toStrictEqual({})
}

function registerTests(): void {
  test("reescreve o erro de cooling down", coolingDownRewritten)
  test("reescreve o erro model_cooldown", modelCooldownRewritten)
  test("mantém o erro que já tem rate limit", rateLimitUntouched)
  test("mantém outro erro", unrelatedErrorUntouched)
  test("mantém a mensagem de assistente sem erro", completedAssistantUntouched)
  test("mantém a mensagem que não é do assistente", userMessageUntouched)
}

describe("cooldown-retry", registerTests)
