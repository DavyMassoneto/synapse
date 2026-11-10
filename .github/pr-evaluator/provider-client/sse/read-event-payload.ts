import { DATA_PREFIX, DONE_PAYLOAD } from "./constants"
import { type EventPayload } from "./types"

export function readEventPayload(line: string): EventPayload {
  if (!line.startsWith(DATA_PREFIX)) {
    return { kind: "none" }
  }
  const payload = line.slice(DATA_PREFIX.length).trim()
  if (payload === DONE_PAYLOAD) {
    return { kind: "none" }
  }
  return { kind: "data", payload }
}
