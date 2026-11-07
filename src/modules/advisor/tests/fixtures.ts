import { AdvisorService } from "@/modules/advisor/internal";
import { type ConfigLoadResult, type ConfigPort } from "@/modules/advisor/internal/config";
import { type ThinkingLevel } from "@/modules/advisor/public/config";
import {
  type ModelPort,
  type ModelRequest,
  type ModelResponse,
  type ResolvedModel,
} from "@/modules/advisor/public/consultation";

export { AdvisorService };

export class TestStorage implements ConfigPort {
  failSave = false;
  loads = 0;
  saves = 0;

  constructor(
    readonly model = "provider/model",
    readonly thinking: ThinkingLevel = "low",
  ) {}

  load(): ConfigLoadResult {
    this.loads += 1;
    return { kind: "loaded", config: { model: this.model, thinking: this.thinking } };
  }

  save(): void {
    this.saves += 1;
    if (this.failSave) {
      throw new Error("disco indisponível");
    }
  }
}

export class TestModel implements ModelPort {
  calls = 0;
  captured: ModelRequest | undefined;
  resolved: ResolvedModel | undefined;
  resolvedReference: string | undefined;
  controller: AbortController | undefined;
  cancelAt: "resolve" | "execute" | undefined;
  failure = false;
  cancelled = false;
  gate: Promise<void> | undefined;
  window = 40_000;

  async resolve(reference: string): Promise<ResolvedModel> {
    this.calls += 1;
    this.resolvedReference = reference;
    if (this.cancelAt === "resolve") {
      this.controller?.abort();
    }
    if (this.gate) {
      await this.gate;
    }
    return {
      reference,
      contextWindow: this.window,
      maxOutputTokens: 32_000,
      reasoningTokens: 2_048,
      effectiveThinking: "low",
    };
  }

  async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    this.resolved = resolved;
    this.captured = request;
    if (this.cancelAt === "execute") {
      this.controller?.abort();
    }
    if (this.failure) {
      throw new Error("provider error");
    }
    if (this.cancelled) {
      return { kind: "cancelled" };
    }
    return { kind: "success", text: "advice" };
  }
}
