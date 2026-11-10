import { type StreamChunk } from "./types"

export function ensureNoProviderError(chunk: StreamChunk): void {
  if (chunk.error instanceof Object) {
    throw new Error(`Erro do provedor: ${chunk.error.message}`)
  }
}
