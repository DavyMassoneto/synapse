import { applyPayload } from "./apply-payload"
import { readEventPayload } from "./read-event-payload"
import { type StreamResult } from "./types"

export function applyLine(result: StreamResult, line: string): void {
  const event = readEventPayload(line)
  if (event.kind === "data") {
    applyPayload(result, event.payload)
  }
}
