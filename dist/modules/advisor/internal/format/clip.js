"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clip = clip;
const limits_1 = require("./limits");
const transcript_text_1 = require("./transcript-text");
function clip(text, limit) {
    if (limit <= 0) {
        return "";
    }
    if (text.length <= limit) {
        return text;
    }
    const marker = transcript_text_1.CLIPPED_CONTENT;
    if (limit <= marker.length) {
        return text.slice(0, limit);
    }
    const available = limit - marker.length;
    const head = Math.floor(available * limits_1.HEAD_FRACTION);
    const tail = available - head;
    return text.slice(0, head) + marker + text.slice(-tail);
}
