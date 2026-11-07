"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorService = void 0;
const config_1 = require("./config");
const constants_1 = require("./constants");
const consultation_1 = require("./consultation");
const reminder_1 = require("./reminder");
class AdvisorService {
    consultationInstructions = constants_1.CONSULTATION_INSTRUCTIONS;
    configuration;
    reminder = new reminder_1.ReminderCounter();
    constructor(config, loaded) {
        this.configuration = new config_1.AdvisorConfiguration(config, loaded);
    }
    isEnabled(status = this.configuration.status()) {
        return status.kind === "success" && Boolean(status.config.model);
    }
    turn(event) {
        if (!this.isEnabled()) {
            return undefined;
        }
        if (this.reminder.advance(event)) {
            return reminder_1.REMINDER;
        }
        return undefined;
    }
    async consult(input, model) {
        if (input.signal?.aborted) {
            return { kind: "cancelled" };
        }
        const status = this.configuration.status();
        if (status.kind === "failure") {
            return status;
        }
        return (0, consultation_1.consultAdvisor)(input, model, status.config);
    }
}
exports.AdvisorService = AdvisorService;
