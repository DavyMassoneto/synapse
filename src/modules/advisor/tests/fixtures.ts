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

  constructor(private readonly window = 40_000) {}

  async resolve(reference: string): Promise<ResolvedModel> {
    this.calls += 1;
    this.resolvedReference = reference;
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
    return { kind: "success", text: "advice" };
  }
}

export class CancelOnResolveModel extends TestModel {
  constructor(private readonly controller: AbortController) {
    super();
  }
  override async resolve(reference: string): Promise<ResolvedModel> {
    const resolved = await super.resolve(reference);
    this.controller.abort();
    return resolved;
  }
}

export class CancelOnConsultModel extends TestModel {
  constructor(private readonly controller: AbortController) {
    super();
  }
  override async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    const response = await super.consult(resolved, request);
    this.controller.abort();
    return response;
  }
}

export class CancelledModel extends TestModel {
  override async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    await super.consult(resolved, request);
    return { kind: "cancelled" };
  }
}

export class FailingModel extends TestModel {
  override async consult(): Promise<ModelResponse> {
    throw new Error("provider error");
  }
}

export class WaitingModel extends TestModel {
  constructor(private readonly gate: Promise<void>) {
    super();
  }
  override async resolve(reference: string): Promise<ResolvedModel> {
    const resolved = await super.resolve(reference);
    await this.gate;
    return resolved;
  }
}
