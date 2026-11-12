import { TEST_USAGE } from "../context"
import { type CooldownAssistantFields } from "./types"

export const COOLDOWN_ASSISTANT_FIELDS: CooldownAssistantFields = {
  role: "assistant",
  api: "anthropic-messages",
  provider: "provider",
  model: "provider/model",
  usage: TEST_USAGE,
  timestamp: 0,
}

export const COOLING_DOWN_ERROR = "All credentials for model grok are cooling down"

export const MODEL_COOLDOWN_ERROR = "MODEL_COOLDOWN: nenhum provedor disponível"

export const RATE_LIMIT_ERROR = "All credentials for model grok are cooling down; rate limit reached"

export const UNRELATED_ERROR = "connection refused"

export const REWRITE_PREFIX = "429 rate limit: "
