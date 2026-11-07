"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdvisor = registerAdvisor;
const command_1 = require("./command");
const events_1 = require("./events");
const session_start_1 = require("./session-start");
const tool_1 = require("./tool");
function registerAdvisor(pi, advisor, signal, shutdown) {
    const catalog = new command_1.ModelCatalog();
    pi.on("session_start", session_start_1.startAdvisorSession.bind(undefined, pi, advisor, catalog));
    (0, events_1.registerEvents)(pi, advisor, shutdown);
    (0, tool_1.registerTool)(pi, advisor, signal);
    (0, command_1.registerCommand)(pi, advisor, catalog);
}
