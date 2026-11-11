import { MAX_OUTPUT_TOKENS, type ModelConfiguration } from "#evaluator/configuration"
import {
  CACHE_CONTROL_HEADER,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
  MODEL_TEMPERATURE,
  MODEL_TIMEOUT_MS,
  NO_CACHE_DIRECTIVE,
} from "./constants"

export function postChat(configuration: ModelConfiguration, prompt: string): Promise<Response> {
  return fetch(`${configuration.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.apiKey}`,
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [CACHE_CONTROL_HEADER]: NO_CACHE_DIRECTIVE,
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
