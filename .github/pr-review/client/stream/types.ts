import { type Static } from "typebox"
import { type StreamChunkSchema } from "./schemas"

export type StreamChunk = Static<typeof StreamChunkSchema>

export type Delta = StreamChunk["choices"][number]["delta"]
