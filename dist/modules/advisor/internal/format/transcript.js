"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTranscript = buildTranscript;
const limits_1 = require("./limits");
const render_message_1 = require("./render-message");
const select_messages_1 = require("./select-messages");
function buildTranscript(messages, budget) {
    if (budget <= 0) {
        return "";
    }
    let blocks = [];
    for (const limit of limits_1.CONTENT_LIMITS) {
        blocks = [];
        for (const message of messages) {
            const text = (0, render_message_1.renderMessage)(message, limit);
            if (text) {
                blocks.push(text);
            }
        }
        const full = blocks.join(limits_1.SEPARATOR);
        if (full.length <= budget) {
            return full;
        }
    }
    return (0, select_messages_1.selectMessages)(blocks, budget);
}
