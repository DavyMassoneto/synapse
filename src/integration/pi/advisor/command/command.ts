import { type SessionStartEvent } from "@earendil-works/pi-coding-agent";
import { type AdvisorContext, type AdvisorHost } from "@/integration/pi/advisor";
import {
  ADVISOR_MESSAGES,
  currentStatus,
  modelStatus,
  noMatchingModel,
  thinkingStatus,
} from "@/integration/pi/advisor/presentation";
import { syncAdvisor } from "@/integration/pi/advisor/sync";
import { type Advisor, type AdvisorResult } from "@/modules";
import { ModelCatalog } from "./catalog.ts";
import { parseAdvisorCommand } from "./parser.ts";
import { type ModelSelection } from "./selection-types.ts";

const MODEL_SELECTION_LIMIT = 100;
const DISABLED_OPTION = ADVISOR_MESSAGES.disabledOption;

class AdvisorCommand {
  readonly catalog = new ModelCatalog();

  constructor(
    private readonly pi: AdvisorHost,
    private readonly advisor: Advisor,
  ) {}

  start(_event: SessionStartEvent, context: AdvisorContext): void {
    this.catalog.refresh(context);
  }

  private notifyStatus(context: AdvisorContext, status: AdvisorResult, message: string): void {
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }
    syncAdvisor(this.pi, this.advisor, context);
    context.ui.notify(message, "info");
  }

  private changeThinking(context: AdvisorContext, requested: string): void {
    const status = this.advisor.setThinking(requested);
    this.notifyStatus(context, status, thinkingStatus(requested));
  }

  private async chooseModel(context: AdvisorContext, input: string): Promise<ModelSelection> {
    if (!input) {
      const choice = await context.ui.select(ADVISOR_MESSAGES.title, [
        DISABLED_OPTION,
        ...this.catalog.list(),
      ]);
      if (choice === undefined) {
        return { kind: "cancelled" };
      }
      if (choice === DISABLED_OPTION) {
        return { kind: "disabled" };
      }
      return { kind: "selected", model: choice };
    }

    const matches = this.catalog.search(input);
    if (matches.length === 0) {
      context.ui.notify(noMatchingModel(input), "error");
      return { kind: "cancelled" };
    }
    if (matches.length === 1) {
      return { kind: "selected", model: matches[0] };
    }
    if (context.hasUI) {
      const choice = await context.ui.select(
        ADVISOR_MESSAGES.title,
        matches.slice(0, MODEL_SELECTION_LIMIT),
      );
      if (choice !== undefined) {
        return { kind: "selected", model: choice };
      }
      return { kind: "cancelled" };
    }
    context.ui.notify(ADVISOR_MESSAGES.ambiguousModel, "warning");
    return { kind: "cancelled" };
  }

  async handle(args: string, context: AdvisorContext): Promise<void> {
    this.catalog.refresh(context);
    const status = this.advisor.status();
    const input = parseAdvisorCommand(args);

    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }

    if (input.kind === "disable") {
      this.notifyStatus(context, this.advisor.disable(), ADVISOR_MESSAGES.disabled);
      return;
    }
    if (input.kind === "thinking") {
      this.changeThinking(context, input.level);
      return;
    }
    if (!input.query && !context.hasUI) {
      context.ui.notify(currentStatus(status.config.model, status.config.thinking), "info");
      return;
    }

    const chosen = await this.chooseModel(context, input.query);
    if (chosen.kind === "disabled") {
      this.notifyStatus(context, this.advisor.disable(), ADVISOR_MESSAGES.disabled);
    } else if (chosen.kind === "selected") {
      this.notifyStatus(context, this.advisor.selectModel(chosen.model), modelStatus(chosen.model));
    }
  }
}

export function registerCommand(pi: AdvisorHost, advisor: Advisor): void {
  const command = new AdvisorCommand(pi, advisor);
  pi.on("session_start", command.start.bind(command));
  pi.registerCommand("advisor", {
    description: ADVISOR_MESSAGES.commandDescription,
    getArgumentCompletions: command.catalog.completions.bind(command.catalog),
    handler: command.handle.bind(command),
  });
}
