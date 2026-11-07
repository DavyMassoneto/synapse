"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeStart = beforeStart;
const sync_1 = require("../sync");
function beforeStart(pi, advisor, event, context) {
    (0, sync_1.syncAdvisor)(pi, advisor, context);
    if (advisor.isEnabled()) {
        event.systemPromptOptions.sections.advisor = advisor.consultationInstructions;
    }
    else {
        delete event.systemPromptOptions.sections.advisor;
    }
}
