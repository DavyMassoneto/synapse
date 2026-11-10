import { applyChoice } from "./apply-choice"
import { type StreamChunk, type StreamResult } from "./types"

export function applyChoices(result: StreamResult, chunk: StreamChunk): void {
  if (Array.isArray(chunk.choices)) {
    for (const choice of chunk.choices) {
      applyChoice(result, choice)
    }
  }
}
