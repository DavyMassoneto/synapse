"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchModels = searchModels;
function searchModels(models, input) {
    const query = input.toLowerCase();
    const terms = query.split(/\s+/);
    const matches = [];
    for (const model of models) {
        const normalized = model.toLowerCase();
        if (normalized === query) {
            return [model];
        }
        let matched = true;
        for (const term of terms) {
            if (!normalized.includes(term)) {
                matched = false;
                break;
            }
        }
        if (matched) {
            matches.push(model);
        }
    }
    return matches;
}
