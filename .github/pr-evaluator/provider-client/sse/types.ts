import { type Static } from "typebox"
import { type StreamChunkSchema } from "./constants"

export type StreamChunk = Static<typeof StreamChunkSchema>

export type StreamChoice = NonNullable<StreamChunk["choices"]>[number]

export interface StreamResult {
  content: string
  finishReason?: string
}
