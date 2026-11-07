import type { ConsultationResult } from "#synapse/modules";
import type { AdvisorToolOutput } from "../contracts";
import { TOOL_TEXT } from "../presentation";
import { toolFailure } from "./failure";

export function consultationResult(result: ConsultationResult): AdvisorToolOutput {
  if (result.kind === "cancelled") {
    return toolFailure(TOOL_TEXT.cancelled);
  }
  if (result.kind === "failure") {
    return toolFailure(result.message);
  }
  return {
    content: [{ type: "text", text: result.response.text }],
    details: { model: result.model },
    usage: result.response.usage,
  };
}
