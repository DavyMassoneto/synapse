import { type ModelConfiguration } from "#evaluator/configuration"
import { buildRequestBody } from "./build-request-body"
import { ERROR_BODY_CHARACTERS, MODEL_TIMEOUT_MS } from "./constants"
import { ModelHttpError } from "./model-http-error"
import { ensureCompleted, readSseStream } from "./sse"

export async function sendRequest(configuration: ModelConfiguration, prompt: string): Promise<string> {
  const response = await fetch(`${configuration.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${configuration.apiKey}`, "Content-Type": "application/json" },
    body: buildRequestBody(configuration, prompt),
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, ERROR_BODY_CHARACTERS)
    throw new ModelHttpError(response.status, `Modelo respondeu ${response.status}: ${detail}`)
  }
  if (!(response.body instanceof ReadableStream)) {
    throw new Error("O modelo respondeu sem corpo")
  }
  return ensureCompleted(await readSseStream(response.body))
}
