"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thinkingLiteral = thinkingLiteral;
const typebox_1 = require("typebox");
function thinkingLiteral(level) {
    return typebox_1.Type.Literal(level);
}
