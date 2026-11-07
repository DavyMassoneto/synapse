"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolResult = toolResult;
const constants_1 = require("../constants");
function toolResult(advisor, event) {
    if (event.toolName === constants_1.ADVISOR_NAME) {
        advisor.reminder.reset();
    }
}
