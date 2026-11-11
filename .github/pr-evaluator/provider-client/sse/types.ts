import { type Static } from "typebox"
import { type StreamChunkSchema, type USAGE_REPORTED, type USAGE_UNREPORTED } from "./constants"

export type StreamChunk = Static<typeof StreamChunkSchema>

export type StreamChoice = NonNullable<StreamChunk["choices"]>[number]

export type ToolCallDelta = NonNullable<StreamChoice["delta"]["tool_calls"]>[number]

export interface PendingToolCall {
  id: string
  name: string
  arguments: string
}

export type PendingToolCalls = Map<number, PendingToolCall>

export interface StreamResult {
  content: string
  usage: ModelTokenUsage
  cache: ModelCacheUsage
  finishReason?: string
  toolCalls: PendingToolCalls
}

export interface ReportedModelCache {
  kind: typeof USAGE_REPORTED
  tokens: number
}

export interface UnreportedModelCache {
  kind: typeof USAGE_UNREPORTED
}

export type ModelCacheUsage = ReportedModelCache | UnreportedModelCache

export interface ReportedModelTokens {
  kind: typeof USAGE_REPORTED
  promptTokens: number
  completionTokens: number
}

export interface UnreportedModelTokens {
  kind: typeof USAGE_UNREPORTED
}

export type ModelTokenUsage = ReportedModelTokens | UnreportedModelTokens
