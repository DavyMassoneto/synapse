import { type TSchema } from "typebox"

export interface ToolCallFunction {
  name: string
  arguments: string
}

export interface ToolCall {
  function: ToolCallFunction
}

export interface UserMessage {
  role: "user"
  content: string
}

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
  messages: UserMessage[]
  tools: ToolDefinition[]
  forcedTool: string
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
  messages: UserMessage[]
  tools: ToolDefinition[]
  tool_choice: ForcedToolChoice
}

export interface ModelReply {
  toolCalls: ToolCall[]
}
