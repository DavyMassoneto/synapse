import { AdvisorConfiguration, type ConfigPort } from "@/modules/advisor/internal/config";
import { ADVISOR_SYSTEM, preparePrompt, REMINDER, TIMING } from "@/modules/advisor/internal/format";
import { ReminderCounter } from "@/modules/advisor/internal/reminder";
import { type AdvisorResult, type ThinkingLevel } from "@/modules/advisor/public/config";
import {
  type Consultation,
  type ConsultationResult,
  type ModelPort,
} from "@/modules/advisor/public/consultation";
import { type Advisor, type ReminderTurn } from "@/modules/advisor/public/types";

export class AdvisorService implements Advisor {
  readonly timing = TIMING;
  private readonly configuration: AdvisorConfiguration;
  private readonly reminder = new ReminderCounter();

  constructor(config: ConfigPort) {
    this.configuration = new AdvisorConfiguration(config);
  }

  status(): AdvisorResult {
    return this.configuration.status();
  }
  selectModel(model: string): AdvisorResult {
    return this.configuration.selectModel(model);
  }
  disable(): AdvisorResult {
    return this.configuration.disable();
  }
  setThinking(thinking: ThinkingLevel): AdvisorResult {
    return this.configuration.setThinking(thinking);
  }
  reset(): void {
    this.reminder.reset();
  }
  turn(event: ReminderTurn): string | undefined {
    const status = this.configuration.status();
    if (status.kind === "failure" || !status.config.model) {
      return undefined;
    }
    if (this.reminder.advance(event)) {
      return REMINDER;
    }
    return undefined;
  }

  async consult(input: Consultation, model: ModelPort): Promise<ConsultationResult> {
    if (input.signal?.aborted) {
      return { kind: "cancelled" };
    }
    const status = this.configuration.status();
    if (status.kind === "failure") {
      return status;
    }
    const configuration = status.config;
    if (!configuration.model) {
      return { kind: "failure", message: "no advisor model configured" };
    }
    try {
      const resolved = await model.resolve(
        configuration.model,
        configuration.thinking,
        input.signal,
      );
      if (input.signal?.aborted) {
        return { kind: "cancelled" };
      }
      const prompt = preparePrompt(input, resolved);
      if (prompt === undefined) {
        return {
          kind: "failure",
          message: "A janela do advisor é pequena demais para a consulta.",
        };
      }
      const response = await model.consult(resolved, {
        system: ADVISOR_SYSTEM,
        prompt,
        signal: input.signal,
      });
      if (input.signal?.aborted || response.kind === "cancelled") {
        return { kind: "cancelled" };
      }
      return { kind: "success", model: resolved.reference, response };
    } catch (error) {
      if (input.signal?.aborted) {
        return { kind: "cancelled" };
      }
      const message = error instanceof Error ? error.message : String(error);
      return { kind: "failure", message };
    }
  }
}
