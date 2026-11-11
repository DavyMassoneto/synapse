import {
  type Config,
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ModelRequest,
  type ModelResponse,
  type ResolvedModel,
  type ThinkingLevel,
} from "#synapse/modules/advisor/public/contracts"
import { NO_MODEL_CONFIGURED } from "./constants"
import { ADVISOR_SYSTEM, preparePrompt } from "./prompt"

function modelRequest(input: Consultation, prompt: string): ModelRequest {
  return { system: ADVISOR_SYSTEM, prompt, signal: input.signal }
}

function consultationOutcome(
  input: Consultation,
  resolved: ResolvedModel,
  response: ModelResponse,
): ConsultationResult {
  if (input.signal.aborted || response.kind === "cancelled") {
    return { kind: "cancelled" }
  }
  if (response.kind === "failure") {
    return response
  }
  return { kind: "success", model: resolved.reference, response }
}

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
  const response = await model.consult(resolved, modelRequest(input, prompt.text))
  return consultationOutcome(input, resolved, response)
}

async function consultModel(
  input: Consultation,
  model: ModelPort,
  reference: string,
  thinking: ThinkingLevel,
): Promise<ConsultationResult> {
  const resolution = await model.resolve(reference, thinking, input.signal)
  if (resolution.kind === "resolved") {
    return consultResolved(input, model, resolution.model)
  }
  return resolution
}

export async function consultAdvisor(
  input: Consultation,
  model: ModelPort,
  config: Config,
): Promise<ConsultationResult> {
  if (config.model) {
    return consultModel(input, model, config.model, config.thinking)
  }
  return { kind: "failure", message: NO_MODEL_CONFIGURED }
}
