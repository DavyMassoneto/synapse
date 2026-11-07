"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractText = extractText;
function extractText(blocks) {
    const parts = [];
    for (const block of blocks) {
        if (block.type === "text") {
            parts.push(block.text);
        }
    }
    return parts.join("\n");
}
