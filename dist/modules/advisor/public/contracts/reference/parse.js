"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModelReference = parseModelReference;
function parseModelReference(reference) {
    const separator = reference.indexOf("/");
    if (separator <= 0 || separator === reference.length - 1) {
        return undefined;
    }
    return { provider: reference.slice(0, separator), id: reference.slice(separator + 1) };
}
