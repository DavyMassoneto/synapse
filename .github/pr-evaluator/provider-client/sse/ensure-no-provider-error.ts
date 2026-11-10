import { providerErrorMessage } from "./provider-error-message"
import { type StreamChunk } from "./types"

export function ensureNoProviderError(chunk: StreamChunk): void {
  if (chunk.error) {
    throw new Error(providerErrorMessage(chunk.error))
  }
}
