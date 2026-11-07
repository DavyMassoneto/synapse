"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorConfiguration = void 0;
const contracts_1 = require("#synapse/modules/advisor/public/contracts");
const constants_1 = require("../constants");
const initialize_1 = require("./initialize");
class AdvisorConfiguration {
    config;
    current;
    constructor(config, loaded) {
        this.config = config;
        this.current = (0, initialize_1.initialConfiguration)(loaded);
    }
    status() {
        if (this.current.kind === "failure") {
            return { ...this.current };
        }
        return { kind: "success", config: { ...this.current.config } };
    }
    persist(status) {
        try {
            this.config.save(status);
            this.current = { kind: "success", config: status };
            return this.status();
        }
        catch {
            return { kind: "failure", message: constants_1.ADVISOR_DIAGNOSTICS.saveFailed };
        }
    }
    selectModel(model) {
        if (!(0, contracts_1.parseModelReference)(model)) {
            return { kind: "failure", message: constants_1.ADVISOR_DIAGNOSTICS.invalidModel };
        }
        if (this.current.kind === "failure") {
            return this.status();
        }
        return this.persist({ model, thinking: this.current.config.thinking });
    }
    disable() {
        if (this.current.kind === "failure") {
            return this.status();
        }
        return this.persist({ thinking: this.current.config.thinking });
    }
    setThinking(requested) {
        let thinking;
        for (const level of contracts_1.THINKING_LEVELS) {
            if (level === requested) {
                thinking = level;
                break;
            }
        }
        if (thinking === undefined) {
            return { kind: "failure", message: constants_1.ADVISOR_DIAGNOSTICS.invalidThinking };
        }
        if (this.current.kind === "failure") {
            return this.status();
        }
        return this.persist({ model: this.current.config.model, thinking });
    }
}
exports.AdvisorConfiguration = AdvisorConfiguration;
