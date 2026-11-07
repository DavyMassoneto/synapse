"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compose = compose;
const modules_1 = require("../modules");
const config_path_1 = require("./config-path");
function compose(configPath = (0, config_path_1.advisorConfigPath)()) {
    const controller = new AbortController();
    return {
        advisor: (0, modules_1.createAdvisor)(configPath),
        signal: controller.signal,
        shutdown: controller.abort.bind(controller),
    };
}
