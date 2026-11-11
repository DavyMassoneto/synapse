import { type Advisor, type ConsultationResult } from "#synapse/modules"
import { AdvisorModel } from "../model-consultation"
import { captureTranscript } from "../transcript"
import { TOOL_CANCELLED } from "./constants"
import { reportProgress, toolFailure, toolOutput, unavailableOutput } from "./tool-output"
import {
  type AdvisorToolInput,
  type AdvisorToolResult,
  type AdvisorToolSignal,
  type AdvisorToolUpdate,
  type ToolContext,
} from "./types"

export class AdvisorToolHandler {
  private readonly advisor: Advisor
  private readonly lifetime: AbortSignal

  constructor(advisor: Advisor, lifetime: AbortSignal) {
    this.advisor = advisor
    this.lifetime = lifetime
  }

  async execute(
    _id: string,
    _params: AdvisorToolInput,
    signal: AdvisorToolSignal,
    onUpdate: AdvisorToolUpdate,
    context: ToolContext,
  ): AdvisorToolResult {
    const callSignal = this.callSignal(signal)
    if (callSignal.aborted) {
      return toolFailure(TOOL_CANCELLED)
    }
    return this.consultReporting(callSignal, onUpdate, context)
  }

  private async consultReporting(
    signal: AbortSignal,
    onUpdate: AdvisorToolUpdate,
    context: ToolContext,
  ): AdvisorToolResult {
    try {
      reportProgress(onUpdate)
      return toolOutput(await this.consult(signal, context))
    } catch (error) {
      if (error instanceof Error) {
        return unavailableOutput(error, signal)
      }
      throw error
    }
  }

  private callSignal(signal: AdvisorToolSignal): AbortSignal {
    if (signal) {
      return AbortSignal.any([signal, this.lifetime])
    }
    return this.lifetime
  }

  private consult(signal: AbortSignal, context: ToolContext): Promise<ConsultationResult> {
    return this.advisor.consult(
      { system: context.getSystemPrompt(), messages: captureTranscript(context), signal },
      new AdvisorModel(context.modelRegistry),
    )
  }
}
