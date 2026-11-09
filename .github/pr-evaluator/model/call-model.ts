import { setTimeout as delay } from "node:timers/promises"
import { type ModelSettings } from "../settings"
import {
  ERROR_BODY_CHARACTERS,
  LENGTH_FINISH,
  MAX_OUTPUT_TOKENS,
  MODEL_ATTEMPTS,
  MODEL_TIMEOUT_MS,
  RETRY_DELAY_MS,
} from "./constants"
import { ModelHttpError } from "./model-http-error"
import { isRetryable } from "./predicates"
import { readStream } from "./read-stream"

function requestBody(settings: ModelSettings, prompt: string): string {
  return JSON.stringify({
    model: settings.model,
    stream: true,
    temperature: 0,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [{ role: "user", content: prompt }],
  })
}

async function requestOnce(settings: ModelSettings, prompt: string): Promise<string> {
  const response = await fetch(`${settings.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${settings.apiKey}`, "Content-Type": "application/json" },
    body: requestBody(settings, prompt),
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, ERROR_BODY_CHARACTERS)
    throw new ModelHttpError(response.status, `Modelo respondeu ${response.status}: ${detail}`)
  }
  if (!(response.body instanceof ReadableStream)) {
    throw new Error("O modelo respondeu sem corpo")
  }
  const result = await readStream(response.body)
  if (result.finishReason === LENGTH_FINISH) {
    throw new Error("O modelo cortou a resposta no limite de tokens de saída")
  }
  if (result.content.trim().length === 0) {
    throw new Error("O modelo não devolveu texto")
  }
  return result.content
}

async function attempt(settings: ModelSettings, prompt: string, remaining: number): Promise<string> {
  try {
    return await requestOnce(settings, prompt)
  } catch (error) {
    if (remaining > 0 && error instanceof Error && isRetryable(error)) {
      console.log(`Chamada ao modelo falhou (${error.message}); nova tentativa em ${RETRY_DELAY_MS} ms`)
      await delay(RETRY_DELAY_MS)
      return attempt(settings, prompt, remaining - 1)
    }
    throw error
  }
}

export function callModel(settings: ModelSettings, prompt: string): Promise<string> {
  return attempt(settings, prompt, MODEL_ATTEMPTS - 1)
}
