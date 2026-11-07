"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderEntry = reminderEntry;
const constants_1 = require("../constants");
function reminderEntry(content) {
    return { type: "custom_message", customType: constants_1.REMINDER_TYPE, content, display: constants_1.REMINDER_DISPLAY };
}
