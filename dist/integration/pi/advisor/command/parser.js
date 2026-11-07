"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAdvisorCommand = parseAdvisorCommand;
const keywords_1 = require("./keywords");
function parseAdvisorCommand(args) {
    const input = args.trim();
    if (input === keywords_1.DISABLE_COMMAND) {
        return { kind: "disable" };
    }
    const [command, ...rest] = input.split(/\s+/);
    if (command === keywords_1.THINKING_COMMAND) {
        return { kind: "thinking", level: rest.join(" ") };
    }
    return { kind: "select", query: input };
}
