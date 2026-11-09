import {
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ResolvedModel,
} from "#synapse/modules/advisor/public/contracts"
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
  if (prompt.kind === "failure") {
    return prompt
  }
  const response = await model.consult(resolved, {
    system: ADVISOR_SYSTEM,
    prompt: prompt.text,
    signal: input.signal,
  })
  if (input.signal.aborted || response.kind === "cancelled") {
    return { kind: "cancelled" }
  }
  return { kind: "success", model: resolved.reference, response }
}
