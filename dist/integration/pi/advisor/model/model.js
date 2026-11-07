"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorModel = void 0;
const pi_ai_1 = require("@earendil-works/pi-ai");
const modules_1 = require("#synapse/modules");
const diagnostics_1 = require("./diagnostics");
const model_request_1 = require("./model-request");
const model_response_1 = require("./model-response");
const reasoning_budgets_1 = require("./reasoning-budgets");
class AdvisorModel {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    findModel(reference) {
        const parsed = (0, modules_1.parseModelReference)(reference);
        if (!parsed) {
            throw new Error(diagnostics_1.MODEL_DIAGNOSTICS.invalidReference);
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
    async resolve(reference, thinking, signal) {
        signal?.throwIfAborted();
        const model = this.findModel(reference);
        const level = (0, pi_ai_1.clampThinkingLevel)(model, thinking);
        let reasoningTokens = 0;
        for (const budget of reasoning_budgets_1.REASONING_BUDGETS) {
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
    async consult(resolved, request) {
        const model = this.findModel(resolved.reference);
        if (model.contextWindow !== resolved.contextWindow ||
            model.maxTokens !== resolved.maxOutputTokens) {
            throw new Error(diagnostics_1.MODEL_DIAGNOSTICS.capabilitiesChanged);
        }
        const reply = await this.registry
            .streamSimple(model, (0, model_request_1.consultationContext)(request), (0, model_request_1.consultationOptions)(resolved, request))
            .result();
        return (0, model_response_1.modelResponse)(reply);
    }
}
exports.AdvisorModel = AdvisorModel;
