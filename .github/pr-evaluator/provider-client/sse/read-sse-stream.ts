import { EVENT_LINE_BREAK } from "./constants"
import { consumeText } from "./consume-text"
import { type StreamResult } from "./types"

export async function readSseStream(body: ReadableStream<Uint8Array>): Promise<StreamResult> {
  const decoder = new TextDecoder()
  const result: StreamResult = { content: "" }
  let pending = ""
  for await (const bytes of body) {
    pending = consumeText(result, pending + decoder.decode(bytes, { stream: true }))
  }
  consumeText(result, `${pending}${decoder.decode()}${EVENT_LINE_BREAK}`)
  return result
}
