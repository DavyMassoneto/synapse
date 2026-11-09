import { type Static } from "typebox"
import { type FindingSchema, type ReplySchema, type StreamChunkSchema } from "./constants"

export type Finding = Static<typeof FindingSchema>

export type Reply = Static<typeof ReplySchema>

export interface StreamResult {
  content: string
  finishReason?: string
}

export type StreamChoice = NonNullable<Static<typeof StreamChunkSchema>["choices"]>[number]
