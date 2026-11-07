"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorToolHandler = void 0;
const presentation_1 = require("../presentation");
const consult_1 = require("./consult");
const failure_1 = require("./failure");
class AdvisorToolHandler {
    advisor;
    lifetime;
    constructor(advisor, lifetime) {
        this.advisor = advisor;
        this.lifetime = lifetime;
    }
    async execute(_id, _params, signal, onUpdate, context) {
        let callSignal = this.lifetime;
        if (signal) {
            callSignal = AbortSignal.any([signal, this.lifetime]);
        }
        if (callSignal.aborted) {
            return (0, failure_1.toolFailure)(presentation_1.TOOL_TEXT.cancelled);
        }
        return (0, consult_1.consultTool)(this.advisor, callSignal, context, onUpdate);
    }
}
exports.AdvisorToolHandler = AdvisorToolHandler;
