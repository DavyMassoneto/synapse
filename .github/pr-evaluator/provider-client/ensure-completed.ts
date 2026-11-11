import { STOP_FINISH } from "./constants"
import { type StreamResult } from "./types"

export function ensureCompleted(result: StreamResult): string {
  if (result.finishReason === STOP_FINISH) {
    return result.content
  }
  if (result.finishReason) {
    throw new Error(`A resposta do modelo não terminou normalmente (término: ${result.finishReason})`)
  }
  throw new Error("A resposta do modelo não terminou normalmente (o fluxo acabou sem indicar o término)")
}
