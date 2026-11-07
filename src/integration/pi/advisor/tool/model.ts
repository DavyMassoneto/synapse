import { type Api, clampThinkingLevel, type Model } from "@earendil-works/pi-ai";
import type { ModelRequest, ModelResponse, ResolvedModel, ThinkingLevel } from "#synapse/modules";
import { MODEL_DIAGNOSTICS } from "./diagnostics.ts";
import type { AdvisorModelRegistry } from "./model-types.ts";

export class AdvisorModel {
  constructor(private readonly registry: AdvisorModelRegistry) {}

  private findModel(reference: string): Model<Api> {
    const separator = reference.indexOf("/");
    if (separator <= 0 || separator === reference.length - 1) {
      throw new Error(MODEL_DIAGNOSTICS.invalidReference);
    }

    const provider = reference.slice(0, separator);
    const modelId = reference.slice(separator + 1);
    const model = this.registry.find(provider, modelId);
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
    if (level === "minimal") {
      reasoningTokens = 1_024;
    } else if (level === "low") {
      reasoningTokens = 2_048;
    } else if (level === "medium") {
      reasoningTokens = 8_192;
    } else if (level === "high" || level === "xhigh" || level === "max") {
      reasoningTokens = 16_384;
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
    const reasoning = resolved.effectiveThinking !== "off" ? resolved.effectiveThinking : undefined;
    const reply = await this.registry
      .streamSimple(
        model,
        {
          systemPrompt: request.system,
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: request.prompt }],
              timestamp: Date.now(),
            },
          ],
        },
        { signal: request.signal, reasoning },
      )
      .result();

    if (reply.stopReason === "aborted") {
      return { kind: "cancelled" };
    }
    if (reply.stopReason === "error") {
      throw new Error(reply.errorMessage ?? reply.stopReason);
    }

    const parts: string[] = [];
    for (const block of reply.content) {
      if (block.type === "text") {
        parts.push(block.text);
      }
    }
    const text = parts.join("\n").trim();
    if (!text) {
      throw new Error(MODEL_DIAGNOSTICS.emptyResponse);
    }

    const usage = reply.usage;
    return {
      kind: "success",
      text,
      usage: {
        input: usage.input,
        output: usage.output,
        cacheRead: usage.cacheRead,
        cacheWrite: usage.cacheWrite,
        totalTokens: usage.totalTokens,
        cost: {
          input: usage.cost.input,
          output: usage.cost.output,
          cacheRead: usage.cost.cacheRead,
          cacheWrite: usage.cost.cacheWrite,
          total: usage.cost.total,
        },
      },
    };
  }
}
