import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type ModelResponse } from "#synapse/modules/advisor/public"
import { EMPTY_RESPONSE } from "./constants"
import { extractText } from "./extract-text"

function failureReason(reply: AssistantMessage): string {
  if (reply.errorMessage) {
    return reply.errorMessage
  }
  return reply.stopReason
}

export function modelResponse(reply: AssistantMessage): ModelResponse {
  if (reply.stopReason === "aborted") {
    return { kind: "cancelled" }
  }
  if (reply.stopReason === "error") {
    throw new Error(failureReason(reply))
  }
  const text = extractText(reply.content).trim()
  if (text.length === 0) {
    throw new Error(EMPTY_RESPONSE)
  }
  const usage = reply.usage
  return {
    kind: "success",
    text,
    usage: {
      input: usage.input,
      output: usage.output,
      cacheRead: usage.cacheRead,
      cacheWrite: usage.cacheWrite,
      totalTokens: usage.totalTokens,
      cost: {
        input: usage.cost.input,
        output: usage.cost.output,
        cacheRead: usage.cost.cacheRead,
        cacheWrite: usage.cost.cacheWrite,
        total: usage.cost.total,
      },
    },
  }
}
