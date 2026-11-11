import { type ConsultationResult } from "#synapse/modules"
import { TEXT_CONTENT } from "../content-text"
import { TOOL_CANCELLED, TOOL_PROGRESS, TOOL_UNAVAILABLE } from "./constants"
import { type AdvisorToolOutput, type AdvisorToolUpdate } from "./types"

export function reportProgress(onUpdate: AdvisorToolUpdate): void {
  onUpdate?.({ content: [{ type: TEXT_CONTENT, text: TOOL_PROGRESS }], details: {} })
}

export function toolFailure(message: string): AdvisorToolOutput {
  return { content: [{ type: TEXT_CONTENT, text: message }], details: {}, isError: true }
}

export function toolOutput(result: ConsultationResult): AdvisorToolOutput {
  if (result.kind === "cancelled") {
    return toolFailure(TOOL_CANCELLED)
  }
  if (result.kind === "failure") {
    return toolFailure(result.message)
  }
  return {
    content: [{ type: TEXT_CONTENT, text: result.response.text }],
    details: { model: result.model },
    usage: result.response.usage,
  }
}

export function unavailableOutput(error: Error, signal: AbortSignal): AdvisorToolOutput {
  if (signal.aborted) {
    return toolFailure(TOOL_CANCELLED)
  }
  return toolFailure(`${TOOL_UNAVAILABLE}${error.message}`)
}
