import { type Advisor, type ConsultationResult } from "#synapse/modules/advisor/public"
import { type AdvisorContext } from "../host"
import { AdvisorModel } from "../model-consultation"
import { captureTranscript } from "../transcript"
import { TOOL_CANCELLED, TOOL_PROGRESS } from "./constants"
import {
  type AdvisorToolInput,
  type AdvisorToolOutput,
  type AdvisorToolResult,
  type AdvisorToolSignal,
  type AdvisorToolUpdate,
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
    context: AdvisorContext,
  ): AdvisorToolResult {
    const callSignal = this.callSignal(signal)
    if (callSignal.aborted) {
      return this.failure(TOOL_CANCELLED)
    }
    try {
      onUpdate?.({ content: [{ type: "text", text: TOOL_PROGRESS }], details: {} })
      return this.output(await this.consult(callSignal, context))
    } catch (error) {
      if (error instanceof Error) {
        return this.unavailable(error, callSignal)
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

  private consult(signal: AbortSignal, context: AdvisorContext): Promise<ConsultationResult> {
    return this.advisor.consult(
      { system: context.getSystemPrompt(), messages: captureTranscript(context), signal },
      new AdvisorModel(context.modelRegistry),
    )
  }

  private output(result: ConsultationResult): AdvisorToolOutput {
    if (result.kind === "cancelled") {
      return this.failure(TOOL_CANCELLED)
    }
    if (result.kind === "failure") {
      return this.failure(result.message)
    }
    return {
      content: [{ type: "text", text: result.response.text }],
      details: { model: result.model },
      usage: result.response.usage,
    }
  }

  private unavailable(error: Error, signal: AbortSignal): AdvisorToolOutput {
    if (signal.aborted) {
      return this.failure(TOOL_CANCELLED)
    }
    return this.failure(`Advisor indisponível: ${error.message}.`)
  }

  private failure(message: string): AdvisorToolOutput {
    return { content: [{ type: "text", text: message }], details: {}, isError: true }
  }
}
