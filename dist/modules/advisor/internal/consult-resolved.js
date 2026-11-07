"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultResolved = consultResolved;
const constants_1 = require("./constants");
const format_1 = require("./format");
async function consultResolved(input, model, resolved) {
    if (input.signal?.aborted) {
        return { kind: "cancelled" };
    }
    const prompt = (0, format_1.preparePrompt)(input, resolved);
    if (prompt === undefined) {
        return { kind: "failure", message: constants_1.ADVISOR_DIAGNOSTICS.windowTooSmall };
    }
    const response = await model.consult(resolved, {
        system: constants_1.ADVISOR_SYSTEM,
        prompt,
        signal: input.signal,
    });
    if (input.signal?.aborted || response.kind === "cancelled") {
        return { kind: "cancelled" };
    }
    return { kind: "success", model: resolved.reference, response };
}
