import { type ModelReply } from "#evaluator/provider-client"
import { SUBMIT_REVIEW } from "./constants"

export function hasSubmission(reply: ModelReply): boolean {
  return reply.toolCalls.some((call) => call.function.name === SUBMIT_REVIEW)
}
