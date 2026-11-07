"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertContent = convertContent;
function convertContent(content) {
    if (typeof content === "string") {
        return [{ kind: "text", text: content }];
    }
    const blocks = [];
    for (const block of content) {
        if (block.type === "text") {
            blocks.push({ kind: "text", text: block.text });
        }
        else {
            blocks.push({ kind: "image" });
        }
    }
    return blocks;
}
