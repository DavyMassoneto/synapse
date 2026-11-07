"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdvisorTool = updateAdvisorTool;
const constants_1 = require("../constants");
function updateAdvisorTool(pi, enabled) {
    const active = pi.getActiveTools();
    if (enabled && !active.includes(constants_1.ADVISOR_NAME)) {
        pi.setActiveTools([...active, constants_1.ADVISOR_NAME]);
    }
    else if (!enabled && active.includes(constants_1.ADVISOR_NAME)) {
        const remaining = [...active];
        let index = remaining.indexOf(constants_1.ADVISOR_NAME);
        while (index !== -1) {
            remaining.splice(index, 1);
            index = remaining.indexOf(constants_1.ADVISOR_NAME);
        }
        pi.setActiveTools(remaining);
    }
}
