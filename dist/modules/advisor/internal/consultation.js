"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultAdvisor = consultAdvisor;
const constants_1 = require("./constants");
const consult_resolved_1 = require("./consult-resolved");
async function consultAdvisor(input, model, config) {
    if (!config.model) {
        return { kind: "failure", message: constants_1.ADVISOR_DIAGNOSTICS.noModel };
    }
    try {
        const resolved = await model.resolve(config.model, config.thinking, input.signal);
        return await (0, consult_resolved_1.consultResolved)(input, model, resolved);
    }
    catch (error) {
        if (input.signal?.aborted) {
            return { kind: "cancelled" };
        }
        let message = String(error);
        if (error instanceof Error) {
            message = error.message;
        }
        return { kind: "failure", message };
    }
}
