import { type ModelConfiguration } from "#evaluator/configuration"
import { buildRequestBody } from "./build-request-body"
import { MODEL_TIMEOUT_MS } from "./constants"

export function postChat(configuration: ModelConfiguration, prompt: string): Promise<Response> {
  return fetch(`${configuration.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${configuration.apiKey}`, "Content-Type": "application/json" },
    body: buildRequestBody(configuration, prompt),
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  })
}
