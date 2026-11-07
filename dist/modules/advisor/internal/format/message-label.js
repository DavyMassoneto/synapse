"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageLabel = messageLabel;
const transcript_text_1 = require("./transcript-text");
function messageLabel(message) {
    if (message.kind === "toolResult") {
        let error = "";
        if (message.error) {
            error = transcript_text_1.ERROR_LABEL;
        }
        return `[${transcript_text_1.TOOL_RESULT_LABEL} ${message.tool}${error}]`;
    }
    if (message.kind === "shell") {
        return `[${transcript_text_1.SHELL_LABEL}] $ ${message.command}`;
    }
    if (message.kind === "custom") {
        return `[${transcript_text_1.CONTEXT_LABEL}:${message.customType}]`;
    }
    if (message.kind === "summary") {
        return transcript_text_1.SUMMARY_LABEL;
    }
    return `[${message.kind}]`;
}
