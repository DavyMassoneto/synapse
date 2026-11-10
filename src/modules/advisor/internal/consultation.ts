import {
  type Config,
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ResolvedModel,
  type ThinkingLevel,
} from "#synapse/modules/advisor/public/contracts"
import { CONSULTATION_DIAGNOSTICS } from "./constants"
import { ADVISOR_SYSTEM, preparePrompt } from "./prompt"

async function consultResolved(
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

async function consultModel(
  input: Consultation,
  model: ModelPort,
  reference: string,
  thinking: ThinkingLevel,
): Promise<ConsultationResult> {
  try {
    const resolved = await model.resolve(reference, thinking, input.signal)
    return await consultResolved(input, model, resolved)
  } catch (error) {
    if (input.signal.aborted) {
      return { kind: "cancelled" }
    }
    if (error instanceof Error) {
      return { kind: "failure", message: error.message }
    }
    throw error
  }
}

export async function consultAdvisor(
  input: Consultation,
  model: ModelPort,
  config: Config,
): Promise<ConsultationResult> {
  if (config.model) {
    return consultModel(input, model, config.model, config.thinking)
  }
  return { kind: "failure", message: CONSULTATION_DIAGNOSTICS.noModel }
}
