import { type Static } from "typebox"
import { type StreamChunkSchema } from "./schemas"

export type StreamChunk = Static<typeof StreamChunkSchema>

export type Delta = StreamChunk["choices"][number]["delta"]

export type ChatRole = "system" | "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
}

export type ModelCaller = (messages: ChatMessage[]) => Promise<string>

export interface ChatPayload {
  model: string
  stream: boolean
  reasoning_effort: string
  max_tokens: number
  temperature: number
  messages: ChatMessage[]
}
