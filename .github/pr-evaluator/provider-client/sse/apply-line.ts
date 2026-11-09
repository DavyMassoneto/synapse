import { applyPayload } from "./apply-payload"
import { DATA_PREFIX, DONE_PAYLOAD } from "./constants"
import { type StreamResult } from "./types"

export function applyLine(result: StreamResult, line: string): void {
  const payload = line.slice(DATA_PREFIX.length).trim()
  if (line.startsWith(DATA_PREFIX) && payload !== DONE_PAYLOAD) {
    applyPayload(result, payload)
  }
}
