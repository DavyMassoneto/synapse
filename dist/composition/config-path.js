"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advisorConfigPath = advisorConfigPath;
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const constants_1 = require("./constants");
function advisorConfigPath() {
    return (0, node_path_1.join)((0, node_os_1.homedir)(), ...constants_1.ADVISOR_CONFIG_SEGMENTS);
}
