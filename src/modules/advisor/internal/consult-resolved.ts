import {
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ResolvedModel,
} from "#synapse/modules/advisor/public/contracts"
import { ADVISOR_DIAGNOSTICS, ADVISOR_SYSTEM } from "./constants"
import { preparePrompt } from "./format"

export async function consultResolved(
  input: Consultation,
  model: ModelPort,
  resolved: ResolvedModel,
): Promise<ConsultationResult> {
  if (input.signal.aborted) {
    return { kind: "cancelled" }
  }
  const prompt = preparePrompt(input, resolved)
  if (prompt === undefined) {
    return { kind: "failure", message: ADVISOR_DIAGNOSTICS.windowTooSmall }
  }
  const response = await model.consult(resolved, {
    system: ADVISOR_SYSTEM,
    prompt,
    signal: input.signal,
  })
  if (input.signal.aborted || response.kind === "cancelled") {
    return { kind: "cancelled" }
  }
  return { kind: "success", model: resolved.reference, response }
}
