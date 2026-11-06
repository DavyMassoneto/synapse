import {
  ADVISOR_SYSTEM,
  buildTranscript,
  clip,
  REMINDER,
  TIMING,
} from "@/modules/advisor/internal";
import { AdvisorConfiguration, type ConfigPort } from "@/modules/advisor/internal/config";
import { ReminderCounter } from "@/modules/advisor/internal/reminder";
import {
  type Advisor,
  type AdvisorResult,
  type Consultation,
  type ConsultationResult,
  type ModelPort,
  type ReminderTurn,
  type ThinkingLevel,
} from "@/modules/advisor/public";

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
    if (status.kind === "failure" || !status.status.model) {
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
    const configuration = status.status;
    if (!configuration.model) {
      return { kind: "failure", message: "no advisor model configured" };
    }
    try {
      const contextWindow = await model.contextWindow(configuration.model, input.signal);
      if (input.signal?.aborted) {
        return { kind: "cancelled" };
      }
      const available = contextWindow * 3 - ADVISOR_SYSTEM.length - 2_048;
      const promptPrefix = "<executor_system_prompt>\n";
      const transcriptPrefix = "\n</executor_system_prompt>\n\n<transcript>\n";
      const promptSuffix =
        "\n</transcript>\n\nThe executor just called advisor(). Give your guidance now.";
      const fixedLength = promptPrefix.length + transcriptPrefix.length + promptSuffix.length;
      if (available <= fixedLength) {
        return {
          kind: "failure",
          message: "A janela do advisor é pequena demais para a consulta.",
        };
      }
      const systemLimit = Math.min(40_000, Math.floor((available - fixedLength) / 2));
      const system = clip(input.system, systemLimit);
      const transcriptBudget = available - fixedLength - system.length;
      const transcript = buildTranscript(input.messages, transcriptBudget);
      const prompt = promptPrefix + system + transcriptPrefix + transcript + promptSuffix;
      const response = await model.consult({
        system: ADVISOR_SYSTEM,
        prompt,
        model: configuration.model,
        thinking: configuration.thinking,
        signal: input.signal,
      });
      if (input.signal?.aborted) {
        return { kind: "cancelled" };
      }
      return { kind: "success", model: configuration.model, response };
    } catch (error) {
      if (input.signal?.aborted) {
        return { kind: "cancelled" };
      }
      const message = error instanceof Error ? error.message : String(error);
      return { kind: "failure", message };
    }
  }
}
