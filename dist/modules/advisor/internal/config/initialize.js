"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialConfiguration = initialConfiguration;
const defaults_1 = require("./defaults");
function initialConfiguration(loaded) {
    if (loaded.kind === "invalid") {
        return { kind: "failure", message: loaded.message };
    }
    if (loaded.kind === "loaded") {
        return {
            kind: "success",
            config: {
                model: loaded.config.model || undefined,
                thinking: loaded.config.thinking ?? defaults_1.DEFAULT_THINKING,
            },
        };
    }
    return { kind: "success", config: { thinking: defaults_1.DEFAULT_THINKING } };
}
