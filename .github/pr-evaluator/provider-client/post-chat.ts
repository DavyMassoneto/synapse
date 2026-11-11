import { type ModelConfiguration } from "#evaluator/configuration"
import { FRESH_RESPONSE, MAX_OUTPUT_TOKENS, MODEL_TEMPERATURE, MODEL_TIMEOUT_MS } from "./constants"

export function postChat(configuration: ModelConfiguration, prompt: string): Promise<Response> {
  return fetch(`${configuration.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.apiKey}`,
      "Content-Type": "application/json",
      "Cache-Control": FRESH_RESPONSE,
    },
    body: JSON.stringify({
      model: configuration.model,
      stream: true,
      temperature: MODEL_TEMPERATURE,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  })
}
