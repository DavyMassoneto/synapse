import { USAGE_REPORTED } from "./constants"
import { type StreamChunk, type StreamResult } from "./types"

export function applyStreamUsage(result: StreamResult, chunk: StreamChunk): void {
  if (chunk.usage) {
    result.usage = {
      kind: USAGE_REPORTED,
      promptTokens: chunk.usage.prompt_tokens,
      completionTokens: chunk.usage.completion_tokens,
    }
    const details = chunk.usage.prompt_tokens_details
    if (details && "cached_tokens" in details) {
      result.cache = { kind: USAGE_REPORTED, tokens: details.cached_tokens }
    }
  }
}
