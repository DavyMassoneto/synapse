"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdvisor = createAdvisor;
const adapters_1 = require("../adapters");
const internal_1 = require("../internal");
function createAdvisor(path) {
    const storage = new adapters_1.FileConfig(path);
    const loaded = storage.load();
    return new internal_1.AdvisorService(storage, loaded);
}
