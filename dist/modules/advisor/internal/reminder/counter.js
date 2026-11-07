"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderCounter = void 0;
const constants_1 = require("./constants");
class ReminderCounter {
    turns = 0;
    reset() {
        this.turns = 0;
    }
    advance(event) {
        if (!event.completed) {
            return false;
        }
        this.turns += 1;
        if (this.turns < constants_1.REMIND_EVERY || !event.usedTools) {
            return false;
        }
        this.reset();
        return true;
    }
}
exports.ReminderCounter = ReminderCounter;
