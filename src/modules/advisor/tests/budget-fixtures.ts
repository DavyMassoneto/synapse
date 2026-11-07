import { type ConfigLoadResult, type ConfigPort } from "#synapse/modules/advisor/internal/config";
import {
  type ModelPort,
  type ModelRequest,
  type ModelResponse,
  type ResolvedModel,
  type ThinkingLevel,
} from "#synapse/modules/advisor/public";

export class Storage implements ConfigPort {
  load(): ConfigLoadResult {
    return { kind: "loaded", config: { model: "provider/model", thinking: "high" } };
  }
  save(): void {}
}

export class BudgetModel implements ModelPort {
  request: ModelRequest | undefined;

  constructor(private readonly descriptor: ResolvedModel) {}

  async resolve(_reference: string, _thinking: ThinkingLevel): Promise<ResolvedModel> {
    return this.descriptor;
  }

  async consult(_resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    this.request = request;
    return { kind: "success", text: "ok" };
  }
}
