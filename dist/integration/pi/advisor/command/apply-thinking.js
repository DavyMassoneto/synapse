"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyThinking = applyThinking;
const sync_1 = require("../sync");
function applyThinking(pi, advisor, context, level) {
    const result = advisor.configuration.setThinking(level);
    if (result.kind === "failure") {
        context.ui.notify(result.message, "error");
        return;
    }
    (0, sync_1.syncAdvisor)(pi, advisor, context);
    context.ui.notify(`Advisor thinking: ${level}`, "info");
}
