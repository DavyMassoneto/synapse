import {
  ADVISOR_SYSTEM,
  buildTranscript,
  clip,
  REMINDER,
  TIMING,
} from "@/modules/advisor/internal";
import { type ConfigPort } from "@/modules/advisor/internal/config";
import {
  type Advisor,
  type AdvisorResult,
  type AdvisorStatus,
  type Consultation,
  type ModelPort,
  type ModelResponse,
  type ThinkingLevel,
} from "@/modules/advisor/public";

export class AdvisorService implements Advisor {
  readonly timing = TIMING;
  private turns = 0;
  private current: AdvisorResult;

  constructor(private readonly config: ConfigPort) {
    const loaded = config.load();
    if (loaded.kind === "invalid") {
      this.current = { kind: "failure", message: loaded.message };
    } else if (loaded.kind === "loaded") {
      this.current = { kind: "success", status: loaded.config };
    } else {
      this.current = { kind: "success", status: { thinking: "high" } };
    }
  }

  status(): AdvisorResult {
    if (this.current.kind === "failure") {
      return { ...this.current };
    }
    return { kind: "success", status: { ...this.current.status } };
  }

  private persist(status: AdvisorStatus): AdvisorResult {
    if (this.current.kind === "failure") {
      return this.status();
    }
    try {
      this.config.save(status);
      this.current = { kind: "success", status };
      return this.status();
    } catch {
      return { kind: "failure", message: "Não foi possível salvar a configuração do advisor." };
    }
  }

  selectModel(model: string): AdvisorResult {
    const separator = model.indexOf("/");
    if (separator <= 0 || separator === model.length - 1) {
      return { kind: "failure", message: "O modelo deve usar o formato provedor/id." };
    }

    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ model, thinking: this.current.status.thinking });
  }

  disable(): AdvisorResult {
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ thinking: this.current.status.thinking });
  }

  setThinking(thinking: ThinkingLevel): AdvisorResult {
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ model: this.current.status.model, thinking });
  }

  reset(): void {
    this.turns = 0;
  }

  turn(completed: boolean, hasTools: boolean): string | undefined {
    if (!completed || this.current.kind === "failure" || !this.current.status.model) {
      return undefined;
    }
    this.turns += 1;
    if (this.turns < 5 || !hasTools) {
      return undefined;
    }
    this.turns = 0;
    return REMINDER;
  }

  async consult(input: Consultation, model: ModelPort): Promise<ModelResponse> {
    if (this.current.kind === "failure") {
      throw new Error(this.current.message);
    }
    const configuration = this.current.status;
    if (!configuration.model) {
      throw new Error("no advisor model configured");
    }
    const system = clip(input.system, 40_000);
    const budget = Math.max(20_000, (input.contextWindow - 26_000) * 3 - system.length);
    const transcript = buildTranscript(input.messages, budget);
    const prompt = [
      "<executor_system_prompt>",
      system,
      "</executor_system_prompt>",
      "",
      "<transcript>",
      transcript,
      "</transcript>",
      "",
      "The executor just called advisor(). Give your guidance now.",
    ].join("\n");
    return model({
      system: ADVISOR_SYSTEM,
      prompt,
      model: configuration.model,
      thinking: configuration.thinking,
      signal: input.signal,
    });
  }
}
