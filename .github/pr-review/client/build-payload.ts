import { type Settings } from "../settings"
import { MAX_TOKENS, REASONING_EFFORT, STREAM_ENABLED, TEMPERATURE } from "./constants"
import { type ChatMessage, type ChatPayload } from "./types"

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
