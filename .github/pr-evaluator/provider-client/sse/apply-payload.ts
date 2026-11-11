import { Value } from "typebox/value"
import { PROVIDER_ERROR_PREFIX, PROVIDER_ERROR_WITHOUT_MESSAGE, StreamChunkSchema, USAGE_REPORTED } from "./constants"
import {
  type PendingToolCall,
  type StreamChoice,
  type StreamChunk,
  type StreamResult,
  type ToolCallDelta,
} from "./types"

function applyStreamUsage(result: StreamResult, chunk: StreamChunk): void {
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

function ensureNoProviderError(chunk: StreamChunk): void {
  if (chunk.error?.message) {
    throw new Error(`${PROVIDER_ERROR_PREFIX}: ${chunk.error.message}`)
  }
  if (chunk.error) {
    throw new Error(PROVIDER_ERROR_WITHOUT_MESSAGE)
  }
}

function pendingCall(result: StreamResult, index: number): PendingToolCall {
  const existing = result.toolCalls.get(index)
  if (existing) {
    return existing
  }
  const created = { id: "", name: "", arguments: "" }
  result.toolCalls.set(index, created)
  return created
}

function applyToolCall(result: StreamResult, delta: ToolCallDelta): void {
  const call = pendingCall(result, delta.index)
  if (delta.id) {
    call.id = delta.id
  }
  if (delta.function?.name) {
    call.name = delta.function.name
  }
  if (delta.function?.arguments) {
    call.arguments += delta.function.arguments
  }
}

function applyChoice(result: StreamResult, choice: StreamChoice): void {
  if (choice.delta.content) {
    result.content += choice.delta.content
  }
  if (choice.delta.tool_calls) {
    for (const delta of choice.delta.tool_calls) {
      applyToolCall(result, delta)
    }
  }
  if (choice.finish_reason) {
    result.finishReason = choice.finish_reason
  }
}

export function applyPayload(result: StreamResult, payload: string): void {
  const chunk = Value.Parse(StreamChunkSchema, JSON.parse(payload))
  ensureNoProviderError(chunk)
  applyStreamUsage(result, chunk)
  if (chunk.choices) {
    for (const choice of chunk.choices) {
      applyChoice(result, choice)
    }
  }
}
