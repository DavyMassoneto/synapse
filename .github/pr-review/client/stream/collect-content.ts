import { Value } from "typebox/value"
import { ModelError } from "#synapse/errors"
import { LINE_BREAK, NO_TEXT, TEXT_ENCODING } from "#synapse/separators"
import { fillTemplate } from "#synapse/templates"
import { ERROR_EMPTY_STREAM, ERROR_LENGTH, SSE_DATA_PREFIX, SSE_DONE, STREAM_HEAD_CHARS } from "./constants"
import { hasLengthFinish, isDataLine } from "./predicates"
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
    for (const line of lines) {
      content += readContentEvent(line, content.length)
    }
  }
  content += readContentEvent(pending + decoder.decode(), content.length)
  if (content.trim().length === 0) {
    throw new ModelError(fillTemplate(ERROR_EMPTY_STREAM, [head]))
  }
  return content
}

export function readEvent(line: string): string {
  return readContentEvent(line, 0)
}

function readContentEvent(line: string, receivedChars: number): string {
  if (!isDataLine(line)) {
    return NO_TEXT
  }
  const payload = line.slice(SSE_DATA_PREFIX.length).trim()
  if (payload === SSE_DONE) {
    return NO_TEXT
  }
  return parseEvent(payload, receivedChars)
}

function parseEvent(payload: string, receivedChars: number): string {
  try {
    const event = Value.Parse(StreamChunkSchema, JSON.parse(payload))
    const content = event.choices.map((choice) => contentOf(choice.delta)).join(NO_TEXT)
    if (hasLengthFinish(event)) {
      throw new ModelError(fillTemplate(ERROR_LENGTH, [String(receivedChars + content.length)]))
    }
    return content
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
