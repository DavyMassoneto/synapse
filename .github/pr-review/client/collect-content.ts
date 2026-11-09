import { ModelError } from "../errors"
import { LINE_BREAK, NO_TEXT } from "../separators"
import { fillTemplate } from "../templates"
import { ERROR_EMPTY_STREAM, STREAM_ENCODING, STREAM_HEAD_CHARS } from "./constants"
import { readEvent } from "./read-event"

export async function collectContent(body: ReadableStream<Uint8Array>): Promise<string> {
  const decoder = new TextDecoder(STREAM_ENCODING)
  let pending = NO_TEXT
  let content = NO_TEXT
  let head = NO_TEXT
  for await (const part of body) {
    const text = decoder.decode(part, { stream: true })
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
