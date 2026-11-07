"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAdvisor = syncAdvisor;
const status_1 = require("./status");
const tool_state_1 = require("./tool-state");
function syncAdvisor(pi, advisor, context) {
    const result = advisor.configuration.status();
    let model;
    if (result.kind === "success") {
        model = result.config.model;
    }
    (0, tool_state_1.updateAdvisorTool)(pi, advisor.isEnabled(result));
    (0, status_1.updateAdvisorStatus)(context, model);
}
