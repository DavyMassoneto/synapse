import { type StreamChoice, type StreamResult } from "./types"

export function applyChoice(result: StreamResult, choice: StreamChoice): void {
  if (typeof choice.delta.content === "string") {
    result.content += choice.delta.content
  }
  if (typeof choice.finish_reason === "string") {
    result.finishReason = choice.finish_reason
  }
}
