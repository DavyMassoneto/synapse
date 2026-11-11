import { type ToolCall } from "#evaluator/provider-client"
import { SUBMIT_REVIEW } from "./constants"

export function isSubmission(call: ToolCall): boolean {
  return call.function.name === SUBMIT_REVIEW
}
