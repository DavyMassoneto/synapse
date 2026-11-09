import { Value } from "typebox/value"
import { applyChoice } from "./apply-choice"
import { StreamChunkSchema } from "./constants"
import { type StreamResult } from "./types"

export function applyPayload(result: StreamResult, payload: string): void {
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
