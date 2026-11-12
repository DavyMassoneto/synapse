import { type ModelConfiguration } from "#evaluator/configuration"
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CACHE_CONTROL_HEADER,
  CHAT_METHOD,
  CHAT_PATH,
  CONTENT_TYPE_HEADER,
  FUNCTION_TYPE,
  JSON_CONTENT_TYPE,
  MAX_OUTPUT_TOKENS,
  MODEL_TEMPERATURE,
  MODEL_TIMEOUT_MS,
  NO_CACHE_DIRECTIVE,
} from "./constants"
import { type ChatBody, type ChatRequest } from "./types"

function chatBody(configuration: ModelConfiguration, request: ChatRequest): ChatBody {
  return {
    model: configuration.model,
    stream: true,
    temperature: MODEL_TEMPERATURE,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: request.messages,
    tools: request.tools,
    tool_choice: { type: FUNCTION_TYPE, function: { name: request.forcedTool } },
  }
}

export function postChat(configuration: ModelConfiguration, request: ChatRequest): Promise<Response> {
  return fetch(`${configuration.baseUrl}${CHAT_PATH}`, {
    method: CHAT_METHOD,
    headers: {
      [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${configuration.apiKey}`,
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [CACHE_CONTROL_HEADER]: NO_CACHE_DIRECTIVE,
    },
    body: JSON.stringify(chatBody(configuration, request)),
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  })
}
