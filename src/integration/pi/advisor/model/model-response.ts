import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type ModelResponse } from "#synapse/modules"
import { extractText } from "../text"
import { MODEL_DIAGNOSTICS } from "./constants"

function failureReason(reply: AssistantMessage): string {
  if (reply.errorMessage === undefined) {
    return reply.stopReason
  }
  return reply.errorMessage
}

export function modelResponse(reply: AssistantMessage): ModelResponse {
  if (reply.stopReason === "aborted") {
    return { kind: "cancelled" }
  }
  if (reply.stopReason === "error") {
    throw new Error(failureReason(reply))
  }
  const text = extractText(reply.content).trim()
  if (!text) {
    throw new Error(MODEL_DIAGNOSTICS.emptyResponse)
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
