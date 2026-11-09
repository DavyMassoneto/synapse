export type ChatRole = "system" | "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatPayload {
  model: string
  stream: boolean
  reasoning_effort: string
  max_tokens: number
  temperature: number
  messages: ChatMessage[]
}
