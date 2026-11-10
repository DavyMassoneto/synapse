import { Value } from "typebox/value"
import { PROVIDER_ERROR_PREFIX, PROVIDER_ERROR_WITHOUT_MESSAGE, StreamChunkSchema } from "./constants"
import { type StreamChoice, type StreamChunk, type StreamResult } from "./types"

function ensureNoProviderError(chunk: StreamChunk): void {
  if (chunk.error?.message) {
    throw new Error(`${PROVIDER_ERROR_PREFIX}: ${chunk.error.message}`)
  }
  if (chunk.error) {
    throw new Error(PROVIDER_ERROR_WITHOUT_MESSAGE)
  }
}

function applyChoice(result: StreamResult, choice: StreamChoice): void {
  if (choice.delta.content) {
    result.content += choice.delta.content
  }
  if (choice.finish_reason) {
    result.finishReason = choice.finish_reason
  }
}

export function applyPayload(result: StreamResult, payload: string): void {
  const chunk = Value.Parse(StreamChunkSchema, JSON.parse(payload))
  ensureNoProviderError(chunk)
  if (chunk.choices) {
    for (const choice of chunk.choices) {
      applyChoice(result, choice)
    }
  }
}
