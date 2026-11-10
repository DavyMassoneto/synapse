import { isPresentObject } from "#evaluator/presence"
import { type StreamChunk } from "./types"

export function ensureNoProviderError(chunk: StreamChunk): void {
  if (isPresentObject(chunk.error)) {
    throw new Error(`Erro do provedor: ${chunk.error.message}`)
  }
}
