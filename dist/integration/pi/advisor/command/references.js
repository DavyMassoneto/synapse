"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelReferences = modelReferences;
const reference_1 = require("./reference");
function modelReferences(context) {
    const references = [];
    if (context.scopedModels.length > 0) {
        for (const entry of context.scopedModels) {
            references.push((0, reference_1.modelReference)(entry.model));
        }
        return references;
    }
    for (const model of context.modelRegistry.getAvailable()) {
        references.push((0, reference_1.modelReference)(model));
    }
    return references;
}
