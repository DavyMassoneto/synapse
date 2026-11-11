import { type TSchema } from "typebox"
import { type ModelCacheUsage, type ModelTokenUsage } from "./sse"

export interface ToolCallFunction {
  name: string
  arguments: string
}

export interface ToolCall {
  id: string
  type: "function"
  function: ToolCallFunction
}

export interface UserMessage {
  role: "user"
  content: string
}

export interface AssistantMessage {
  role: "assistant"
  content: string
  tool_calls?: ToolCall[]
}

export interface ToolMessage {
  role: "tool"
  tool_call_id: string
  content: string
}

export type ChatMessage = UserMessage | AssistantMessage | ToolMessage

export interface ToolFunction {
  name: string
  description: string
  parameters: TSchema
}

export interface ToolDefinition {
  type: "function"
  function: ToolFunction
}

export interface ChatRequest {
  messages: ChatMessage[]
  tools: ToolDefinition[]
  forcedTool?: string
}

export interface ForcedFunction {
  name: string
}

export interface ForcedToolChoice {
  type: "function"
  function: ForcedFunction
}

export interface ChatBody {
  model: string
  stream: boolean
  temperature: number
  max_tokens: number
  messages: ChatMessage[]
  tools: ToolDefinition[]
  tool_choice?: ForcedToolChoice
}

export interface ModelReply {
  content: string
  toolCalls: ToolCall[]
  usage: ModelTokenUsage
  cache: ModelCacheUsage
}
