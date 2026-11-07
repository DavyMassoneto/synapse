import { type SessionStartEvent } from "@earendil-works/pi-coding-agent";
import { type AdvisorContext, type AdvisorHost } from "@/integration/pi/advisor";
import { ADVISOR_NAME } from "@/integration/pi/advisor/identifiers.ts";
import {
  ADVISOR_MESSAGES,
  currentStatus,
  modelStatus,
  thinkingStatus,
} from "@/integration/pi/advisor/presentation";
import { syncAdvisor } from "@/integration/pi/advisor/sync";
import { type Advisor, type AdvisorResult } from "@/modules";
import { ModelCatalog } from "./catalog.ts";
import { chooseModel } from "./choose-model.ts";
import { parseAdvisorCommand } from "./parser.ts";

class AdvisorCommand {
  readonly catalog = new ModelCatalog();

  constructor(
    private readonly pi: AdvisorHost,
    private readonly advisor: Advisor,
  ) {}

  start(_event: SessionStartEvent, context: AdvisorContext): void {
    this.catalog.refresh(context);
  }

  private syncAndNotify(context: AdvisorContext, status: AdvisorResult, message: string): void {
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }
    syncAdvisor(this.pi, this.advisor, context);
    context.ui.notify(message, "info");
  }

  private disable(context: AdvisorContext): void {
    this.syncAndNotify(context, this.advisor.disable(), ADVISOR_MESSAGES.disabled);
  }

  private changeThinking(context: AdvisorContext, requested: string): void {
    const status = this.advisor.setThinking(requested);
    this.syncAndNotify(context, status, thinkingStatus(requested));
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
      this.disable(context);
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

    const chosen = await chooseModel(this.catalog, context, input.query);
    if (chosen.kind === "disabled") {
      this.disable(context);
    } else if (chosen.kind === "selected") {
      this.syncAndNotify(
        context,
        this.advisor.selectModel(chosen.model),
        modelStatus(chosen.model),
      );
    }
  }
}

export function registerCommand(pi: AdvisorHost, advisor: Advisor): void {
  const command = new AdvisorCommand(pi, advisor);
  pi.on("session_start", command.start.bind(command));
  pi.registerCommand(ADVISOR_NAME, {
    description: ADVISOR_MESSAGES.commandDescription,
    getArgumentCompletions: command.catalog.completions.bind(command.catalog),
    handler: command.handle.bind(command),
  });
}
