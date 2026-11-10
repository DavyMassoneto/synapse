import { type Advisor, type ConsultationResult } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { AdvisorModel } from "../model-consultation"
import { captureTranscript } from "../transcript"
import { TOOL_TEXT } from "./constants"
import { toolFailure } from "./failure"
import { type AdvisorToolOutput, type AdvisorToolUpdate } from "./types"

function consultationOutput(result: ConsultationResult): AdvisorToolOutput {
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

export async function consultTool(
  advisor: Advisor,
  signal: AbortSignal,
  context: AdvisorContext,
  onUpdate: AdvisorToolUpdate,
): Promise<AdvisorToolOutput> {
  try {
    onUpdate?.({ content: [{ type: "text", text: TOOL_TEXT.progress }], details: {} })
    const result = await advisor.consult(
      { system: context.getSystemPrompt(), messages: captureTranscript(context), signal },
      new AdvisorModel(context.modelRegistry),
    )
    return consultationOutput(result)
  } catch (error) {
    if (signal.aborted) {
      return toolFailure(TOOL_TEXT.cancelled)
    }
    if (error instanceof Error) {
      return toolFailure(`Advisor indisponível: ${error.message}.`)
    }
    throw error
  }
}
