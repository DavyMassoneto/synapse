"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolFailure = toolFailure;
function toolFailure(message) {
    return { content: [{ type: "text", text: message }], details: {}, isError: true };
}
