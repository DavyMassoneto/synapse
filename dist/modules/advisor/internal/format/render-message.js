"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMessage = renderMessage;
const render_blocks_1 = require("./render-blocks");
const transcript_text_1 = require("./transcript-text");
function renderMessage(message, limit) {
    if (message.kind === "shell" && message.hidden) {
        return "";
    }
    let label = `[${message.kind}]`;
    let clipContent = false;
    if (message.kind === "toolResult") {
        let error = "";
        if (message.error) {
            error = transcript_text_1.ERROR_LABEL;
        }
        label = `[${transcript_text_1.TOOL_RESULT_LABEL} ${message.tool}${error}]`;
        clipContent = true;
    }
    else if (message.kind === "shell") {
        label = `[${transcript_text_1.SHELL_LABEL}] $ ${message.command}`;
        clipContent = true;
    }
    else if (message.kind === "custom") {
        label = `[${transcript_text_1.CONTEXT_LABEL}:${message.customType}]`;
        clipContent = true;
    }
    else if (message.kind === "summary") {
        label = transcript_text_1.SUMMARY_LABEL;
    }
    return (0, render_blocks_1.renderBlocks)(message, limit, label, clipContent);
}
