import { type StreamResult } from "./types"

export function ensureText(result: StreamResult): string {
  if (result.content.trim().length === 0) {
    throw new Error("O modelo não devolveu texto")
  }
  return result.content
}
