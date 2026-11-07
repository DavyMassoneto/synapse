"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdvisorStatus = updateAdvisorStatus;
const constants_1 = require("../constants");
function updateAdvisorStatus(context, model) {
    if (context.hasUI) {
        if (model) {
            context.ui.setStatus(constants_1.ADVISOR_NAME, `advisor: ${model}`);
        }
        else {
            context.ui.setStatus(constants_1.ADVISOR_NAME, undefined);
        }
    }
}
