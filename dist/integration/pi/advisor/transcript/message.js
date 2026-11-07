"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMessage = convertMessage;
const assistant_1 = require("./assistant");
const content_1 = require("./content");
function convertMessage(message) {
    switch (message.role) {
        case "user":
            return { kind: "user", blocks: (0, content_1.convertContent)(message.content) };
        case "assistant":
            return (0, assistant_1.convertAssistant)(message);
        case "toolResult":
            return {
                kind: "toolResult",
                tool: message.toolName,
                error: message.isError,
                blocks: (0, content_1.convertContent)(message.content),
            };
        case "bashExecution":
            return {
                kind: "shell",
                command: message.command,
                hidden: message.excludeFromContext === true,
                blocks: [{ kind: "text", text: message.output }],
            };
        case "custom":
            return {
                kind: "custom",
                customType: message.customType,
                blocks: (0, content_1.convertContent)(message.content),
            };
        case "branchSummary":
        case "compactionSummary":
            return { kind: "summary", blocks: [{ kind: "text", text: message.summary }] };
        default:
            return undefined;
    }
}
