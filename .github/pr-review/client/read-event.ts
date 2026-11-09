import { Value } from "typebox/value"
import { ModelError } from "../errors"
import { NO_TEXT } from "../separators"
import { SSE_DATA_PREFIX, SSE_DONE } from "./constants"
import { contentOf } from "./content-of"
import { isDataLine } from "./predicates"
import { StreamChunkSchema } from "./schemas"

function parseChunk(payload: string): string {
  try {
    const chunk = Value.Parse(StreamChunkSchema, JSON.parse(payload))
    return chunk.choices.map((choice) => contentOf(choice.delta)).join(NO_TEXT)
  } catch (error) {
    if (error instanceof Error) {
      throw new ModelError(error.message, { cause: error })
    }
    throw error
  }
}

export function readEvent(line: string): string {
  if (!isDataLine(line)) {
    return NO_TEXT
  }
  const payload = line.slice(SSE_DATA_PREFIX.length).trim()
  if (payload === SSE_DONE) {
    return NO_TEXT
  }
  return parseChunk(payload)
}
