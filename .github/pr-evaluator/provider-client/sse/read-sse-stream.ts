import { applyLine } from "./apply-line"
import { type StreamResult } from "./types"

export async function readSseStream(body: ReadableStream<Uint8Array>): Promise<StreamResult> {
  const decoder = new TextDecoder()
  const result: StreamResult = { content: "" }
  let pending = ""
  for await (const bytes of body) {
    pending += decoder.decode(bytes, { stream: true })
    const lastBreak = pending.lastIndexOf("\n")
    for (const line of pending.slice(0, lastBreak + 1).split("\n")) {
      applyLine(result, line)
    }
    pending = pending.slice(lastBreak + 1)
  }
  applyLine(result, pending + decoder.decode())
  return result
}
