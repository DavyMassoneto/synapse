"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMessage = renderMessage;
const message_label_1 = require("./message-label");
const render_blocks_1 = require("./render-blocks");
function renderMessage(message, limit) {
    if (message.kind === "shell" && message.hidden) {
        return "";
    }
    return (0, render_blocks_1.renderBlocks)(message, limit, (0, message_label_1.messageLabel)(message));
}
