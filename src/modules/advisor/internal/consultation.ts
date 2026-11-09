import {
  type Config,
  type ConfiguredConfig,
  type Consultation,
  type ConsultationResult,
  hasModel,
  type ModelPort,
} from "#synapse/modules/advisor/public/contracts"
import { CONSULTATION_DIAGNOSTICS } from "./constants"
import { consultResolved } from "./consult-resolved"

async function consultConfigured(
  input: Consultation,
  model: ModelPort,
  config: ConfiguredConfig,
): Promise<ConsultationResult> {
  try {
    const resolved = await model.resolve(config.model, config.thinking, input.signal)
    return await consultResolved(input, model, resolved)
  } catch (error) {
    if (input.signal.aborted) {
      return { kind: "cancelled" }
    }
    let message = String(error)
    if (error instanceof Error) {
      message = error.message
    }
    return { kind: "failure", message }
  }
}

export async function consultAdvisor(
  input: Consultation,
  model: ModelPort,
  config: Config,
): Promise<ConsultationResult> {
  if (hasModel(config)) {
    return consultConfigured(input, model, config)
  }
  return { kind: "failure", message: CONSULTATION_DIAGNOSTICS.noModel }
}
