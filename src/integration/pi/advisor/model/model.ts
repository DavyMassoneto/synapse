import { type Api, clampThinkingLevel, type Model } from "@earendil-works/pi-ai";
import {
  type ModelRequest,
  type ModelResponse,
  parseModelReference,
  type ResolvedModel,
  type ThinkingLevel,
} from "#synapse/modules";
import type { AdvisorModelRegistry } from "../contracts";
import { MODEL_DIAGNOSTICS } from "./diagnostics";
import { consultationContext, consultationOptions } from "./model-request";
import { modelResponse } from "./model-response";
import { REASONING_BUDGETS } from "./reasoning-budgets";

export class AdvisorModel {
  constructor(private readonly registry: AdvisorModelRegistry) {}

  private findModel(reference: string): Model<Api> {
    const parsed = parseModelReference(reference);
    if (!parsed) {
      throw new Error(MODEL_DIAGNOSTICS.invalidReference);
    }

    const model = this.registry.find(parsed.provider, parsed.id);
    if (!model) {
      throw new Error(`Modelo advisor não encontrado: ${reference}`);
    }
    if (!this.registry.hasConfiguredAuth(model)) {
      throw new Error(`Credenciais ausentes para ${reference}`);
    }

    return model;
  }

  async resolve(
    reference: string,
    thinking: ThinkingLevel,
    signal?: AbortSignal,
  ): Promise<ResolvedModel> {
    signal?.throwIfAborted();
    const model = this.findModel(reference);
    const level = clampThinkingLevel(model, thinking);
    let reasoningTokens = 0;
    for (const budget of REASONING_BUDGETS) {
      if (budget.level === level) {
        reasoningTokens = budget.tokens;
        break;
      }
    }
    return {
      reference,
      contextWindow: model.contextWindow,
      maxOutputTokens: model.maxTokens,
      reasoningTokens,
      effectiveThinking: level,
    };
  }

  async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    const model = this.findModel(resolved.reference);
    if (
      model.contextWindow !== resolved.contextWindow ||
      model.maxTokens !== resolved.maxOutputTokens
    ) {
      throw new Error(MODEL_DIAGNOSTICS.capabilitiesChanged);
    }
    const reply = await this.registry
      .streamSimple(model, consultationContext(request), consultationOptions(resolved, request))
      .result();
    return modelResponse(reply);
  }
}
