"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdvisorStatus = updateAdvisorStatus;
const constants_1 = require("../constants");
const presentation_1 = require("../presentation");
function updateAdvisorStatus(context, model) {
    if (context.hasUI) {
        if (model) {
            context.ui.setStatus(constants_1.ADVISOR_NAME, `${presentation_1.STATUS_PREFIX}${model}`);
        }
        else {
            context.ui.setStatus(constants_1.ADVISOR_NAME, undefined);
        }
    }
}
