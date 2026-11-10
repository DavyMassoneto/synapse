import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { TOOL_CANCELLED } from "./constants"
import { consultTool } from "./consult"
import { toolFailure } from "./failure"
import { type AdvisorToolInput, type AdvisorToolResult, type AdvisorToolSignal, type AdvisorToolUpdate } from "./types"

export class AdvisorToolHandler {
  private readonly advisor: Advisor
  private readonly lifetime: AbortSignal

  constructor(advisor: Advisor, lifetime: AbortSignal) {
    this.advisor = advisor
    this.lifetime = lifetime
  }

  private callSignal(signal: AdvisorToolSignal): AbortSignal {
    if (signal) {
      return AbortSignal.any([signal, this.lifetime])
    }
    return this.lifetime
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
      return toolFailure(TOOL_CANCELLED)
    }
    return consultTool(this.advisor, callSignal, context, onUpdate)
  }
}
