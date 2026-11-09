import { HttpStatusError, ModelError } from "#synapse/errors"
import { type Settings } from "#synapse/settings"
import { fillTemplate } from "#synapse/templates"
import { collectContent } from "../stream"
import {
  AUTH_PREFIX,
  CHAT_PATH,
  CONTENT_TYPE_JSON,
  ERROR_EMPTY,
  ERROR_HTTP,
  HEADER_AUTHORIZATION,
  HEADER_CONTENT_TYPE,
  HEADER_USER_AGENT,
  MAX_TOKENS,
  METHOD_POST,
  REASONING_EFFORT,
  STREAM_ENABLED,
  TEMPERATURE,
  TIMEOUT_MS,
  USER_AGENT,
} from "./constants"
import { type ChatMessage, type ChatPayload } from "./types"

export async function requestOnce(settings: Settings, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(settings.baseUrl + CHAT_PATH, {
    method: METHOD_POST,
    headers: buildHeaders(settings),
    body: JSON.stringify(buildPayload(settings, messages)),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new HttpStatusError(response.status, fillTemplate(ERROR_HTTP, [String(response.status)]))
  }
  if (response.body === null) {
    throw new ModelError(ERROR_EMPTY)
  }
  return collectContent(response.body)
}

export function buildHeaders(settings: Settings): Headers {
  const headers = new Headers()
  headers.set(HEADER_AUTHORIZATION, AUTH_PREFIX + settings.apiKey)
  headers.set(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON)
  headers.set(HEADER_USER_AGENT, USER_AGENT)
  return headers
}

export function buildPayload(settings: Settings, messages: ChatMessage[]): ChatPayload {
  return {
    model: settings.model,
    stream: STREAM_ENABLED,
    reasoning_effort: REASONING_EFFORT,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    messages,
  }
}
