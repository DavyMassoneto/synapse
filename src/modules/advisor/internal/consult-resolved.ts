import {
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ResolvedModel,
} from "#synapse/modules/advisor/public/contracts"
import { CONSULTATION_DIAGNOSTICS } from "./constants"
import { ADVISOR_SYSTEM, preparePrompt } from "./prompt"

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
    return { kind: "failure", message: CONSULTATION_DIAGNOSTICS.windowTooSmall }
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
