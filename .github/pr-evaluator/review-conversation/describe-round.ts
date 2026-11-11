import { type ModelCacheUsage, type ModelReply, type ModelTokenUsage, USAGE_REPORTED } from "#evaluator/provider-client"
import {
  CACHED_TOKENS_LABEL,
  COMPLETION_TOKENS_LABEL,
  PROMPT_TOKENS_LABEL,
  ROUND_LABEL,
  TOOL_CALLS_LABEL,
  USAGE_NOT_REPORTED,
} from "./constants"

function cacheDescription(cache: ModelCacheUsage): string {
  if (cache.kind === USAGE_REPORTED) {
    return String(cache.tokens)
  }
  return USAGE_NOT_REPORTED
}

function tokenDescription(usage: ModelTokenUsage): string {
  if (usage.kind === USAGE_REPORTED) {
    return `${PROMPT_TOKENS_LABEL}${usage.promptTokens}${COMPLETION_TOKENS_LABEL}${usage.completionTokens}`
  }
  return `${PROMPT_TOKENS_LABEL}${USAGE_NOT_REPORTED}${COMPLETION_TOKENS_LABEL}${USAGE_NOT_REPORTED}`
}

export function describeReviewRound(round: number, reply: ModelReply): string {
  return `${ROUND_LABEL}${round}${tokenDescription(reply.usage)}${TOOL_CALLS_LABEL}${reply.toolCalls.length}${CACHED_TOKENS_LABEL}${cacheDescription(reply.cache)}`
}
