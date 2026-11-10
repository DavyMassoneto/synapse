import { clampThinkingLevel } from "@earendil-works/pi-ai"
import {
  type ModelRequest,
  type ModelResolution,
  type ModelResponse,
  parseModelReference,
  type ResolvedModel,
  type ThinkingLevel,
} from "#synapse/modules/advisor/public"
import { type AdvisorModelRegistry } from "../host"
import { CAPABILITIES_CHANGED, INVALID_REFERENCE, PI_THINKING_BUDGETS } from "./constants"
import { consultationContext, consultationOptions } from "./model-request"
import { modelResponse } from "./model-response"
import { type ModelLookup } from "./types"

export class AdvisorModel {
  private readonly registry: AdvisorModelRegistry

  constructor(registry: AdvisorModelRegistry) {
    this.registry = registry
  }

  private findModel(reference: string): ModelLookup {
    const parsed = parseModelReference(reference)
    if (parsed.kind === "invalid") {
      return { kind: "failure", message: INVALID_REFERENCE }
    }
    const model = this.registry.find(parsed.provider, parsed.id)
    if (!model) {
      return { kind: "failure", message: `Modelo advisor não encontrado: ${reference}` }
    }
    if (!this.registry.hasConfiguredAuth(model)) {
      return { kind: "failure", message: `Credenciais ausentes para ${reference}` }
    }
    return { kind: "found", model }
  }

  async resolve(reference: string, thinking: ThinkingLevel, signal: AbortSignal): Promise<ModelResolution> {
    if (signal.aborted) {
      return { kind: "cancelled" }
    }
    const lookup = this.findModel(reference)
    if (lookup.kind === "failure") {
      return lookup
    }
    const level = clampThinkingLevel(lookup.model, thinking)
    return {
      kind: "resolved",
      model: {
        reference,
        contextWindow: lookup.model.contextWindow,
        maxOutputTokens: lookup.model.maxTokens,
        reasoningTokens: PI_THINKING_BUDGETS[level],
        effectiveThinking: level,
      },
    }
  }

  async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    const lookup = this.findModel(resolved.reference)
    if (lookup.kind === "failure") {
      return lookup
    }
    const { model } = lookup
    if (model.contextWindow !== resolved.contextWindow || model.maxTokens !== resolved.maxOutputTokens) {
      return { kind: "failure", message: CAPABILITIES_CHANGED }
    }
    const reply = await this.registry
      .streamSimple(model, consultationContext(request), consultationOptions(resolved, request))
      .result()
    return modelResponse(reply)
  }
}
