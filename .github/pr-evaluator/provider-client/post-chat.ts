import { type ModelConfiguration } from "#evaluator/configuration"
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CACHE_CONTROL_HEADER,
  CHAT_METHOD,
  CHAT_PATH,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
  MAX_OUTPUT_TOKENS,
  MODEL_TEMPERATURE,
  MODEL_TIMEOUT_MS,
  NO_CACHE_DIRECTIVE,
  PROMPT_ROLE,
} from "./constants"

export function postChat(configuration: ModelConfiguration, prompt: string): Promise<Response> {
  return fetch(`${configuration.baseUrl}${CHAT_PATH}`, {
    method: CHAT_METHOD,
    headers: {
      [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${configuration.apiKey}`,
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [CACHE_CONTROL_HEADER]: NO_CACHE_DIRECTIVE,
    },
    body: JSON.stringify({
      model: configuration.model,
      stream: true,
      temperature: MODEL_TEMPERATURE,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: PROMPT_ROLE, content: prompt }],
    }),
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  })
}
