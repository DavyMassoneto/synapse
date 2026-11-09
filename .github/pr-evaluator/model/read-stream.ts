import { Value } from "typebox/value"
import { DATA_PREFIX, DONE_PAYLOAD, StreamChunkSchema } from "./constants"
import { type StreamChoice, type StreamResult } from "./types"

function applyChoice(result: StreamResult, choice: StreamChoice): void {
  if (typeof choice.delta.content === "string") {
    result.content += choice.delta.content
  }
  if (typeof choice.finish_reason === "string") {
    result.finishReason = choice.finish_reason
  }
}

function applyPayload(result: StreamResult, payload: string): void {
  const chunk = Value.Parse(StreamChunkSchema, JSON.parse(payload))
  if (chunk.error instanceof Object) {
    throw new Error(`Erro do provedor: ${chunk.error.message}`)
  }
  if (Array.isArray(chunk.choices)) {
    for (const choice of chunk.choices) {
      applyChoice(result, choice)
    }
  }
}

function applyLine(result: StreamResult, line: string): void {
  const payload = line.slice(DATA_PREFIX.length).trim()
  if (line.startsWith(DATA_PREFIX) && payload !== DONE_PAYLOAD) {
    applyPayload(result, payload)
  }
}

export async function readStream(body: ReadableStream<Uint8Array>): Promise<StreamResult> {
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
