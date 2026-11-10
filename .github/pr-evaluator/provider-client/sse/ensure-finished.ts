import { STOP_FINISH } from "./constants"
import { type StreamResult } from "./types"

export function ensureFinished(result: StreamResult): void {
  if (result.finishReason !== STOP_FINISH) {
    throw new Error(`A resposta do modelo não terminou normalmente (término: ${result.finishReason})`)
  }
}
