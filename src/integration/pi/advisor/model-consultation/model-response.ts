import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type ModelResponse, type Usage } from "#synapse/modules"
import { extractText } from "../content-text"
import { EMPTY_RESPONSE, PROVIDER_FAILED } from "./constants"

function failureReason(reply: AssistantMessage): string {
  if (reply.errorMessage) {
    return reply.errorMessage
  }
  return PROVIDER_FAILED
}

function contractUsage(usage: AssistantMessage["usage"]): Usage {
  return {
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
  }
}

export function modelResponse(reply: AssistantMessage): ModelResponse {
  if (reply.stopReason === "aborted") {
    return { kind: "cancelled" }
  }
  if (reply.stopReason === "error") {
    return { kind: "failure", message: failureReason(reply) }
  }
  const text = extractText(reply.content).trim()
  if (text.length === 0) {
    return { kind: "failure", message: EMPTY_RESPONSE }
  }
  return { kind: "success", text, usage: contractUsage(reply.usage) }
}
