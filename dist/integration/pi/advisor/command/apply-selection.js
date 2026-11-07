"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySelection = applySelection;
const presentation_1 = require("../presentation");
const sync_1 = require("../sync");
function applySelection(pi, advisor, context, selection) {
    let result;
    let message;
    if (selection.kind === "disabled") {
        result = advisor.configuration.disable();
        message = presentation_1.COMMAND_TEXT.disabled;
    }
    else if (selection.kind === "selected") {
        result = advisor.configuration.selectModel(selection.model);
        message = `Advisor: ${selection.model}`;
    }
    else {
        return;
    }
    if (result.kind === "failure") {
        context.ui.notify(result.message, "error");
        return;
    }
    (0, sync_1.syncAdvisor)(pi, advisor, context);
    context.ui.notify(message, "info");
}
