import {
  type AdvisorResult,
  type Config,
  parseModelReference,
  THINKING_LEVELS,
  type ThinkingLevel,
} from "#synapse/modules/advisor/public/contracts";
import { ADVISOR_DIAGNOSTICS } from "../constants";
import type { ConfigLoadResult, ConfigPort } from "./contracts";
import { initialConfiguration } from "./initialize";

export class AdvisorConfiguration {
  private current: AdvisorResult;

  constructor(
    private readonly config: ConfigPort,
    loaded: ConfigLoadResult,
  ) {
    this.current = initialConfiguration(loaded);
  }

  status(): AdvisorResult {
    if (this.current.kind === "failure") {
      return { ...this.current };
    }
    return { kind: "success", config: { ...this.current.config } };
  }

  private persist(status: Config): AdvisorResult {
    try {
      this.config.save(status);
      this.current = { kind: "success", config: status };
      return this.status();
    } catch {
      return { kind: "failure", message: ADVISOR_DIAGNOSTICS.saveFailed };
    }
  }

  selectModel(model: string): AdvisorResult {
    if (!parseModelReference(model)) {
      return { kind: "failure", message: ADVISOR_DIAGNOSTICS.invalidModel };
    }

    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ model, thinking: this.current.config.thinking });
  }

  disable(): AdvisorResult {
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ thinking: this.current.config.thinking });
  }

  setThinking(requested: string): AdvisorResult {
    let thinking: ThinkingLevel | undefined;
    for (const level of THINKING_LEVELS) {
      if (level === requested) {
        thinking = level;
        break;
      }
    }
    if (thinking === undefined) {
      return { kind: "failure", message: ADVISOR_DIAGNOSTICS.invalidThinking };
    }
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ model: this.current.config.model, thinking });
  }
}
