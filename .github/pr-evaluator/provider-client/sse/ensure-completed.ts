import { ensureFinished } from "./ensure-finished"
import { ensureText } from "./ensure-text"
import { type StreamResult } from "./types"

export function ensureCompleted(result: StreamResult): string {
  ensureFinished(result)
  return ensureText(result)
}
