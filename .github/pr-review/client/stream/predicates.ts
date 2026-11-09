import { FINISH_REASON_LENGTH, SSE_DATA_PREFIX } from "./constants"
import { type StreamChunk } from "./types"

export function hasLengthFinish(event: StreamChunk): boolean {
  return event.choices.some((choice) => choice.finish_reason === FINISH_REASON_LENGTH)
}

export function isDataLine(line: string): boolean {
  return line.startsWith(SSE_DATA_PREFIX)
}
