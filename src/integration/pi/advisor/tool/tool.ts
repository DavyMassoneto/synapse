import type { Advisor } from "#synapse/modules";
import type {
  AdvisorContext,
  AdvisorToolInput,
  AdvisorToolResult,
  AdvisorToolUpdate,
} from "../contracts";
import { TOOL_TEXT } from "../presentation";
import { consultTool } from "./consult";
import { toolFailure } from "./failure";

export class AdvisorToolHandler {
  constructor(
    private readonly advisor: Advisor,
    private readonly lifetime: AbortSignal,
  ) {}

  async execute(
    _id: string,
    _params: AdvisorToolInput,
    signal: AbortSignal | undefined,
    onUpdate: AdvisorToolUpdate,
    context: AdvisorContext,
  ): AdvisorToolResult {
    let callSignal = this.lifetime;
    if (signal) {
      callSignal = AbortSignal.any([signal, this.lifetime]);
    }
    if (callSignal.aborted) {
      return toolFailure(TOOL_TEXT.cancelled);
    }
    return consultTool(this.advisor, callSignal, context, onUpdate);
  }
}
