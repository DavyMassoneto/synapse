"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSchema = exports.thinkingSchema = void 0;
const typebox_1 = require("typebox");
const contracts_1 = require("../public/contracts");
const thinking_schema_1 = require("./thinking-schema");
exports.thinkingSchema = typebox_1.Type.Union(contracts_1.THINKING_LEVELS.map(thinking_schema_1.thinkingLiteral));
exports.configSchema = typebox_1.Type.Object({
    model: typebox_1.Type.Optional(typebox_1.Type.String()),
    thinking: typebox_1.Type.Optional(exports.thinkingSchema),
});
