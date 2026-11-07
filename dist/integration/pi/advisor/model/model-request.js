"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultationContext = consultationContext;
exports.consultationOptions = consultationOptions;
function consultationContext(request) {
    return {
        systemPrompt: request.system,
        messages: [
            { role: "user", content: [{ type: "text", text: request.prompt }], timestamp: Date.now() },
        ],
    };
}
function consultationOptions(resolved, request) {
    const options = { signal: request.signal };
    if (resolved.effectiveThinking !== "off") {
        options.reasoning = resolved.effectiveThinking;
    }
    return options;
}
