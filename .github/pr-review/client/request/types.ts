import { type ROLE_ASSISTANT, type ROLE_SYSTEM, type ROLE_USER } from "./constants"

export type ChatRole = typeof ROLE_SYSTEM | typeof ROLE_USER | typeof ROLE_ASSISTANT

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
