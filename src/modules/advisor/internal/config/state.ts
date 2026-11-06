import { Value } from "typebox/value";
import { type ConfigPort } from "@/modules/advisor/internal/config/ports";
import {
  type AdvisorResult,
  type AdvisorStatus,
  type ThinkingLevel,
  thinkingSchema,
} from "@/modules/advisor/public/config";

export class AdvisorConfiguration {
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
    if (!Value.Check(thinkingSchema, thinking)) {
      return { kind: "failure", message: "Nível de raciocínio inválido." };
    }
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ model: this.current.status.model, thinking });
  }
}
