import { applyChoice } from "./apply-choice"
import { parseChunk } from "./parse-chunk"
import { type StreamResult } from "./types"

export function applyPayload(result: StreamResult, payload: string): void {
  const chunk = parseChunk(payload)
  if (chunk.error instanceof Object) {
    throw new Error(`Erro do provedor: ${chunk.error.message}`)
  }
  if (Array.isArray(chunk.choices)) {
    for (const choice of chunk.choices) {
      applyChoice(result, choice)
    }
  }
}
