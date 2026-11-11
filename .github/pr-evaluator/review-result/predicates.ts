import { type ModelReply, type ToolCall } from "#evaluator/provider-client"
import { SUBMIT_REVIEW } from "./constants"

export function isSubmission(call: ToolCall): boolean {
  return call.function.name === SUBMIT_REVIEW
}

export function hasSubmission(reply: ModelReply): boolean {
  return reply.toolCalls.some(isSubmission)
}
