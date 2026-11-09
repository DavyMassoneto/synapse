import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { TOOL_TEXT } from "./constants"
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

  async execute(
    _id: string,
    _params: AdvisorToolInput,
    signal: AdvisorToolSignal,
    onUpdate: AdvisorToolUpdate,
    context: AdvisorContext,
  ): AdvisorToolResult {
    let callSignal = this.lifetime
    if (signal instanceof AbortSignal) {
      callSignal = AbortSignal.any([signal, this.lifetime])
    }
    if (callSignal.aborted) {
      return toolFailure(TOOL_TEXT.cancelled)
    }
    return consultTool(this.advisor, callSignal, context, onUpdate)
  }
}
