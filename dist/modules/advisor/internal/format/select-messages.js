"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectMessages = selectMessages;
const clip_1 = require("./clip");
const limits_1 = require("./limits");
const select_recent_1 = require("./select-recent");
const transcript_text_1 = require("./transcript-text");
function selectMessages(blocks, budget) {
    const marker = transcript_text_1.OMITTED_MESSAGES;
    if (budget <= marker.length) {
        return (0, clip_1.clip)(blocks[blocks.length - 1] ?? "", budget);
    }
    const firstBudget = Math.floor((budget - marker.length - limits_1.SEPARATOR.length * 2) / 2);
    if (firstBudget <= 0) {
        return (0, clip_1.clip)(blocks[0] ?? "", budget);
    }
    const first = (0, clip_1.clip)(blocks[0], firstBudget);
    const remaining = budget - first.length - marker.length - limits_1.SEPARATOR.length;
    const selected = (0, select_recent_1.selectRecent)(blocks, remaining);
    return [first, marker, ...selected].join(limits_1.SEPARATOR);
}
