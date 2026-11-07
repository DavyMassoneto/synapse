import type { Advisor } from "#synapse/modules";
import type { AdvisorContext, AdvisorHost } from "../contracts";
import { COMMAND_TEXT } from "../presentation";
import { applySelection } from "./apply-selection";
import { applyThinking } from "./apply-thinking";
import { chooseModel } from "./choose-model";
import { parseAdvisorCommand } from "./parser";

export class AdvisorCommand {
  constructor(
    private readonly pi: AdvisorHost,
    private readonly advisor: Advisor,
  ) {}

  async handle(args: string, context: AdvisorContext): Promise<void> {
    const status = this.advisor.configuration.status();
    const input = parseAdvisorCommand(args);
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }
    if (input.kind === "disable") {
      applySelection(this.pi, this.advisor, context, { kind: "disabled" });
      return;
    }
    if (input.kind === "thinking") {
      applyThinking(this.pi, this.advisor, context, input.level);
      return;
    }
    if (!input.query && !context.hasUI) {
      context.ui.notify(
        `Advisor: ${status.config.model ?? COMMAND_TEXT.disabledStatus}, thinking ${status.config.thinking}`,
        "info",
      );
      return;
    }
    const chosen = await chooseModel(context, input.query);
    applySelection(this.pi, this.advisor, context, chosen);
  }
}
