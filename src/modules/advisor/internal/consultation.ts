import type { Config, Consultation, ConsultationResult, ModelPort } from "../public/contracts";
import { ADVISOR_DIAGNOSTICS } from "./constants";
import { consultResolved } from "./consult-resolved";

export async function consultAdvisor(
  input: Consultation,
  model: ModelPort,
  config: Config,
): Promise<ConsultationResult> {
  if (!config.model) {
    return { kind: "failure", message: ADVISOR_DIAGNOSTICS.noModel };
  }
  try {
    const resolved = await model.resolve(config.model, config.thinking, input.signal);
    return await consultResolved(input, model, resolved);
  } catch (error) {
    if (input.signal?.aborted) {
      return { kind: "cancelled" };
    }
    let message = String(error);
    if (error instanceof Error) {
      message = error.message;
    }
    return { kind: "failure", message };
  }
}
