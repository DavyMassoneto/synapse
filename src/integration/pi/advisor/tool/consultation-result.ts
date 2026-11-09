import { type ConsultationResult } from "#synapse/modules"
import { TOOL_TEXT } from "./constants"
import { toolFailure } from "./failure"
import { type AdvisorToolOutput } from "./types"

export function consultationResult(result: ConsultationResult): AdvisorToolOutput {
  if (result.kind === "cancelled") {
    return toolFailure(TOOL_TEXT.cancelled)
  }
  if (result.kind === "failure") {
    return toolFailure(result.message)
  }
  return {
    content: [{ type: "text", text: result.response.text }],
    details: { model: result.model },
    usage: result.response.usage,
  }
}
