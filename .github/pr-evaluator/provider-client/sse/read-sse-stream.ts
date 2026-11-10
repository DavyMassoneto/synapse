import { applyPayload } from "./apply-payload"
import { DATA_PREFIX, DONE_PAYLOAD, EVENT_LINE_BREAK } from "./constants"
import { type StreamResult } from "./types"

function applyLine(result: StreamResult, line: string): void {
  if (line.startsWith(DATA_PREFIX)) {
    const payload = line.slice(DATA_PREFIX.length).trim()
    if (payload !== DONE_PAYLOAD) {
      applyPayload(result, payload)
    }
  }
}

function applyCompleteLines(result: StreamResult, text: string): string {
  const cut = text.lastIndexOf(EVENT_LINE_BREAK) + 1
  for (const line of text.slice(0, cut).split(EVENT_LINE_BREAK)) {
    applyLine(result, line)
  }
  return text.slice(cut)
}

export async function readSseStream(body: ReadableStream<Uint8Array>): Promise<StreamResult> {
  const decoder = new TextDecoder()
  const result: StreamResult = { content: "" }
  let pending = ""
  for await (const bytes of body) {
    pending = applyCompleteLines(result, pending + decoder.decode(bytes, { stream: true }))
  }
  applyCompleteLines(result, `${pending}${decoder.decode()}${EVENT_LINE_BREAK}`)
  return result
}
