"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAssistant = convertAssistant;
function convertAssistant(message) {
    const blocks = [];
    for (const block of message.content) {
        if (block.type === "text") {
            blocks.push({ kind: "text", text: block.text });
        }
        else if (block.type === "toolCall") {
            blocks.push({ kind: "call", name: block.name, arguments: JSON.stringify(block.arguments) });
        }
    }
    return { kind: "assistant", blocks };
}
