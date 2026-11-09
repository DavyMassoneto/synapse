import { type Static } from "typebox"
import { type StreamChunkSchema } from "./constants"

export type StreamChoice = NonNullable<Static<typeof StreamChunkSchema>["choices"]>[number]

export interface StreamResult {
  content: string
  finishReason?: string
}
