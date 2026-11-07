"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelResponse = modelResponse;
const text_1 = require("../text");
const diagnostics_1 = require("./diagnostics");
function modelResponse(reply) {
    if (reply.stopReason === "aborted") {
        return { kind: "cancelled" };
    }
    if (reply.stopReason === "error") {
        throw new Error(reply.errorMessage ?? reply.stopReason);
    }
    const text = (0, text_1.extractText)(reply.content).trim();
    if (!text) {
        throw new Error(diagnostics_1.MODEL_DIAGNOSTICS.emptyResponse);
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
