import { ADVISOR_DIAGNOSTICS } from "#synapse/modules/advisor/internal/constants";
import {
  type AdvisorResult,
  type Config,
  THINKING_LEVELS,
  type ThinkingLevel,
} from "#synapse/modules/advisor/public";
import { type ConfigLoadResult, type ConfigPort } from "./contracts.ts";

export class AdvisorConfiguration {
  private current: AdvisorResult;

  constructor(
    private readonly config: ConfigPort,
    loaded: ConfigLoadResult,
  ) {
    if (loaded.kind === "invalid") {
      this.current = { kind: "failure", message: loaded.message };
    } else if (loaded.kind === "loaded") {
      this.current = {
        kind: "success",
        config: {
          model: loaded.config.model || undefined,
          thinking: loaded.config.thinking ?? "high",
        },
      };
    } else {
      this.current = { kind: "success", config: { thinking: "high" } };
    }
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
    const separator = model.indexOf("/");
    if (separator <= 0 || separator === model.length - 1) {
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
    for (const level of Object.values(THINKING_LEVELS)) {
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
