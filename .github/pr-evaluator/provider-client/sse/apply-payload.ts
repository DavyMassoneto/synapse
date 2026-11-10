import { applyChoices } from "./apply-choices"
import { ensureNoProviderError } from "./ensure-no-provider-error"
import { parseChunk } from "./parse-chunk"
import { type StreamResult } from "./types"

export function applyPayload(result: StreamResult, payload: string): void {
  const chunk = parseChunk(payload)
  ensureNoProviderError(chunk)
  applyChoices(result, chunk)
}
