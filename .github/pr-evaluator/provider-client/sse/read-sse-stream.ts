import { applyPayload } from "./apply-payload"
import { DATA_PREFIX, DONE_PAYLOAD, EVENT_LINE_BREAK, MAX_STREAM_BYTES, USAGE_UNREPORTED } from "./constants"
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

function ensureWithinStreamLimit(receivedBytes: number): void {
  if (receivedBytes > MAX_STREAM_BYTES) {
    throw new Error(`A resposta do modelo excede ${MAX_STREAM_BYTES} bytes`)
  }
}

export async function readSseStream(body: ReadableStream<Uint8Array>): Promise<StreamResult> {
  const decoder = new TextDecoder()
  const result: StreamResult = {
    content: "",
    usage: { kind: USAGE_UNREPORTED },
    cache: { kind: USAGE_UNREPORTED },
    toolCalls: new Map(),
  }
  let pending = ""
  let receivedBytes = 0
  for await (const bytes of body) {
    receivedBytes += bytes.length
    ensureWithinStreamLimit(receivedBytes)
    pending = applyCompleteLines(result, pending + decoder.decode(bytes, { stream: true }))
  }
  applyCompleteLines(result, `${pending}${decoder.decode()}${EVENT_LINE_BREAK}`)
  return result
}
