"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStart = sessionStart;
const sync_1 = require("../sync");
function sessionStart(pi, advisor, _event, context) {
    advisor.reminder.reset();
    (0, sync_1.syncAdvisor)(pi, advisor, context);
    const status = advisor.configuration.status();
    if (status.kind === "failure" && context.hasUI) {
        context.ui.notify(status.message, "error");
    }
}
