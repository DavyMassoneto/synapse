"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelCatalog = void 0;
const keywords_1 = require("./keywords");
const limits_1 = require("./limits");
const references_1 = require("./references");
class ModelCatalog {
    models = [];
    refresh(_event, context) {
        this.models = (0, references_1.modelReferences)(context);
    }
    completions(prefix) {
        const normalized = prefix.toLowerCase();
        const items = [];
        for (const value of [keywords_1.DISABLE_COMMAND, keywords_1.THINKING_COMMAND, ...this.models]) {
            if (value.toLowerCase().startsWith(normalized)) {
                items.push({ value, label: value });
            }
            if (items.length === limits_1.COMPLETION_LIMIT) {
                break;
            }
        }
        return items;
    }
}
exports.ModelCatalog = ModelCatalog;
