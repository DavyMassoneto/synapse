"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorCommand = void 0;
const presentation_1 = require("../presentation");
const sync_1 = require("../sync");
const apply_selection_1 = require("./apply-selection");
const choose_model_1 = require("./choose-model");
const parser_1 = require("./parser");
class AdvisorCommand {
    pi;
    advisor;
    constructor(pi, advisor) {
        this.pi = pi;
        this.advisor = advisor;
    }
    async handle(args, context) {
        const status = this.advisor.configuration.status();
        const input = (0, parser_1.parseAdvisorCommand)(args);
        if (status.kind === "failure") {
            context.ui.notify(status.message, "error");
            return;
        }
        if (input.kind === "disable") {
            (0, apply_selection_1.applySelection)(this.pi, this.advisor, context, { kind: "disabled" });
            return;
        }
        if (input.kind === "thinking") {
            const result = this.advisor.configuration.setThinking(input.level);
            if (result.kind === "failure") {
                context.ui.notify(result.message, "error");
                return;
            }
            (0, sync_1.syncAdvisor)(this.pi, this.advisor, context);
            context.ui.notify(`Advisor thinking: ${input.level}`, "info");
            return;
        }
        if (!input.query && !context.hasUI) {
            context.ui.notify(`Advisor: ${status.config.model ?? presentation_1.COMMAND_TEXT.disabledStatus}, thinking ${status.config.thinking}`, "info");
            return;
        }
        const chosen = await (0, choose_model_1.chooseModel)(context, input.query);
        (0, apply_selection_1.applySelection)(this.pi, this.advisor, context, chosen);
    }
}
exports.AdvisorCommand = AdvisorCommand;
