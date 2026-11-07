"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEvents = registerEvents;
const before_start_1 = require("./before-start");
const tool_result_1 = require("./tool-result");
const turn_end_1 = require("./turn-end");
function registerEvents(pi, advisor, shutdownCallback) {
    pi.on("session_shutdown", shutdownCallback);
    pi.on("before_agent_start", before_start_1.beforeStart.bind(undefined, pi, advisor));
    pi.on("tool_result", tool_result_1.toolResult.bind(undefined, advisor));
    pi.on("turn_end", turn_end_1.turnEnd.bind(undefined, advisor));
}
