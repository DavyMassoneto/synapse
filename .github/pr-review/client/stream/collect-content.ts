import { Value } from "typebox/value"
import { ModelError } from "#synapse/errors"
import { LINE_BREAK, NO_TEXT, TEXT_ENCODING } from "#synapse/separators"
import { fillTemplate } from "#synapse/templates"
import { ERROR_EMPTY_STREAM, SSE_DATA_PREFIX, SSE_DONE, STREAM_HEAD_CHARS } from "./constants"
import { isDataLine } from "./predicates"
import { StreamChunkSchema } from "./schemas"
import { type Delta } from "./types"

export async function collectContent(body: ReadableStream<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder(TEXT_ENCODING)
  let pending = NO_TEXT
  let content = NO_TEXT
  let head = NO_TEXT
  for await (const bytes of body) {
    const text = decoder.decode(bytes, { stream: true })
    head = (head + text).slice(0, STREAM_HEAD_CHARS)
    pending += text
    const lines = pending.split(LINE_BREAK)
    pending = lines.splice(-1).join(NO_TEXT)
    content += lines.map((line) => readEvent(line)).join(NO_TEXT)
  }
  content += readEvent(pending + decoder.decode())
  if (content.trim().length === 0) {
    throw new ModelError(fillTemplate(ERROR_EMPTY_STREAM, [head]))
  }
  return content
}

export function readEvent(line: string): string {
  if (!isDataLine(line)) {
    return NO_TEXT
  }
  const payload = line.slice(SSE_DATA_PREFIX.length).trim()
  if (payload === SSE_DONE) {
    return NO_TEXT
  }
  return parseEvent(payload)
}

function parseEvent(payload: string): string {
  try {
    const event = Value.Parse(StreamChunkSchema, JSON.parse(payload))
    return event.choices.map((choice) => contentOf(choice.delta)).join(NO_TEXT)
  } catch (error) {
    if (error instanceof Error) {
      throw new ModelError(error.message, { cause: error })
    }
    throw error
  }
}

export function contentOf(delta: Delta): string {
  if (typeof delta.content === "string") {
    return delta.content
  }
  return NO_TEXT
}
