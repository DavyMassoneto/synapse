"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultationResult = consultationResult;
const presentation_1 = require("../presentation");
const failure_1 = require("./failure");
function consultationResult(result) {
    if (result.kind === "cancelled") {
        return (0, failure_1.toolFailure)(presentation_1.TOOL_TEXT.cancelled);
    }
    if (result.kind === "failure") {
        return (0, failure_1.toolFailure)(result.message);
    }
    return {
        content: [{ type: "text", text: result.response.text }],
        details: { model: result.model },
        usage: result.response.usage,
    };
}
