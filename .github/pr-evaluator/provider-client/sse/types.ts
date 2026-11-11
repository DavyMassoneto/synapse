import { type Static } from "typebox"
import { type StreamChunkSchema } from "./constants"

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
  finishReason?: string
  toolCalls: PendingToolCalls
}
