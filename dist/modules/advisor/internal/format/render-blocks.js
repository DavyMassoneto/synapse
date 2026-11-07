"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBlocks = renderBlocks;
const clip_1 = require("./clip");
const transcript_text_1 = require("./transcript-text");
function renderBlocks(message, limit, label, clipContent) {
    const parts = [label];
    for (const block of message.blocks) {
        if (block.kind === "image") {
            parts.push(transcript_text_1.IMAGE_OMITTED);
        }
        else if (block.kind === "call") {
            parts.push(`[${transcript_text_1.TOOL_CALL_LABEL} ${block.name}] ${(0, clip_1.clip)(block.arguments, limit)}`);
        }
        else if (clipContent) {
            parts.push((0, clip_1.clip)(block.text, limit));
        }
        else {
            parts.push(block.text);
        }
    }
    return parts.join("\n");
}
