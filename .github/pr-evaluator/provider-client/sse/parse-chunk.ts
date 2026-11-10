import { Value } from "typebox/value"
import { StreamChunkSchema } from "./constants"
import { type StreamChunk } from "./types"

export function parseChunk(payload: string): StreamChunk {
  return Value.Parse(StreamChunkSchema, JSON.parse(payload))
}
