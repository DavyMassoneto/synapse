"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turnEnd = turnEnd;
const reminder_entry_1 = require("./reminder-entry");
function turnEnd(advisor, event) {
    const reminder = advisor.turn({
        completed: event.outcome === "completed",
        usedTools: event.toolResults.length > 0,
    });
    if (!reminder) {
        return undefined;
    }
    return { entries: [...event.entries, (0, reminder_entry_1.reminderEntry)(reminder)] };
}
