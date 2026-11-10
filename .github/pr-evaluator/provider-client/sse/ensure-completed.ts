import { STOP_FINISH } from "./constants"
import { type StreamResult } from "./types"

export function ensureCompleted(result: StreamResult): string {
  if (result.finishReason !== STOP_FINISH) {
    throw new Error(`A resposta do modelo não terminou normalmente (término: ${result.finishReason})`)
  }
  if (result.content.trim().length === 0) {
    throw new Error("O modelo não devolveu texto")
  }
  return result.content
}
