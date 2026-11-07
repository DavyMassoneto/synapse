"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAdvisorSession = startAdvisorSession;
const events_1 = require("./events");
function startAdvisorSession(pi, advisor, catalog, event, context) {
    catalog.refresh(event, context);
    (0, events_1.sessionStart)(pi, advisor, event, context);
}
