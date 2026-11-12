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

export const COOLDOWN_DISTRIBUTION_PROMPT = "Olá\u2028mundo\u2029!"

export const COOLDOWN_DISTRIBUTION_REPLY = "ok"

export const COOLDOWN_DISTRIBUTION_ERROR = "All credentials for model x are cooling down"

export const COOLDOWN_DISTRIBUTION_PERMANENT_ERROR = "Invalid API key: credencial de teste recusada"
