import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { AdvisorModel } from "../model"
import { captureTranscript } from "../transcript"
import { TOOL_TEXT } from "./constants"
import { consultationResult } from "./consultation-result"
import { toolFailure } from "./failure"
import { type AdvisorToolOutput, type AdvisorToolUpdate } from "./types"

export async function consultTool(
  advisor: Advisor,
  signal: AbortSignal,
  context: AdvisorContext,
  onUpdate: AdvisorToolUpdate,
): Promise<AdvisorToolOutput> {
  try {
    onUpdate?.({ content: [{ type: "text", text: TOOL_TEXT.progress }], details: {} })
    const model = new AdvisorModel(context.modelRegistry)
    const result = await advisor.consult(
      { system: context.getSystemPrompt(), messages: captureTranscript(context), signal },
      model,
    )
    return consultationResult(result)
  } catch (error) {
    if (signal.aborted) {
      return toolFailure(TOOL_TEXT.cancelled)
    }
    let message = String(error)
    if (error instanceof Error) {
      message = error.message
    }
    return toolFailure(`Advisor indisponível: ${message}.`)
  }
}
