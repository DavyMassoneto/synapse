"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommand = registerCommand;
const constants_1 = require("../constants");
const presentation_1 = require("../presentation");
const command_1 = require("./command");
function registerCommand(pi, advisor, catalog) {
    const command = new command_1.AdvisorCommand(pi, advisor);
    pi.registerCommand(constants_1.ADVISOR_NAME, {
        description: presentation_1.COMMAND_TEXT.description,
        getArgumentCompletions: catalog.completions.bind(catalog),
        handler: command.handle.bind(command),
    });
}
