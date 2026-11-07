"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureTranscript = captureTranscript;
const message_1 = require("./message");
function captureTranscript(context) {
    const messages = context.sessionManager.buildSessionProjection().messages;
    const transcript = [];
    for (const message of messages) {
        const converted = (0, message_1.convertMessage)(message);
        if (converted !== undefined) {
            transcript.push(converted);
        }
    }
    return transcript;
}
