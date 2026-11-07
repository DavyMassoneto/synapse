"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = parseConfig;
const value_1 = require("typebox/value");
const config_schema_1 = require("./config-schema");
const diagnostics_1 = require("./diagnostics");
function parseConfig(content) {
    try {
        return { kind: "loaded", config: value_1.Value.Parse(config_schema_1.configSchema, JSON.parse(content)) };
    }
    catch {
        return { kind: "invalid", message: diagnostics_1.CONFIG_DIAGNOSTICS.invalid };
    }
}
