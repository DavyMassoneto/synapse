import {
  type ExtensionAPI,
  type ExtensionCommandContext,
  type ExtensionContext,
  type SessionStartEvent,
} from "@earendil-works/pi-coding-agent";
import { type AutocompleteItem } from "@earendil-works/pi-tui";
import { type ModelSelection, syncAdvisor } from "@/integration";
import { ADVISOR_MESSAGES } from "@/integration/pi/advisor/presentation";
import { type Advisor, type AdvisorResult, THINKING_LEVEL_OPTIONS } from "@/modules";

const COMPLETION_LIMIT = 40;
const MODEL_SELECTION_LIMIT = 100;
const DISABLED_OPTION = ADVISOR_MESSAGES.disabledOption;

class AdvisorCommand {
  private models: string[] = [];

  constructor(
    private readonly pi: ExtensionAPI,
    private readonly advisor: Advisor,
  ) {}

  start(_event: SessionStartEvent, context: ExtensionContext): void {
    this.models = this.modelRefs(context);
  }

  private modelRefs(context: ExtensionContext): string[] {
    const refs: string[] = [];

    if (context.scopedModels.length > 0) {
      for (const entry of context.scopedModels) {
        refs.push(`${entry.model.provider}/${entry.model.id}`);
      }
    } else {
      for (const model of context.modelRegistry.getAvailable()) {
        refs.push(`${model.provider}/${model.id}`);
      }
    }

    return refs;
  }

  completions(prefix: string): AutocompleteItem[] {
    const normalizedPrefix = prefix.toLowerCase();
    const items: AutocompleteItem[] = [];

    for (const value of ["off", "thinking", ...this.models]) {
      if (value.toLowerCase().startsWith(normalizedPrefix)) {
        items.push({ value, label: value });
      }

      if (items.length === COMPLETION_LIMIT) {
        break;
      }
    }

    return items;
  }

  private notifyStatus(context: ExtensionContext, status: AdvisorResult, message: string): void {
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }
    syncAdvisor(this.pi, this.advisor, context);
    context.ui.notify(message, "info");
  }

  private changeThinking(context: ExtensionContext, requested: string): void {
    for (const level of THINKING_LEVEL_OPTIONS) {
      if (level === requested) {
        const status = this.advisor.setThinking(level);
        this.notifyStatus(context, status, `Advisor thinking: ${level}`);
        return;
      }
    }

    context.ui.notify(`Níveis: ${THINKING_LEVEL_OPTIONS.join(", ")}`, "error");
  }

  private matchModels(models: string[], input: string): string[] {
    const search = input.toLowerCase();
    const terms = search.split(/\s+/);
    const matches: string[] = [];

    for (const model of models) {
      const normalizedModel = model.toLowerCase();
      if (normalizedModel === search) {
        return [model];
      }

      let matchesAll = true;
      for (const term of terms) {
        if (!normalizedModel.includes(term)) {
          matchesAll = false;
          break;
        }
      }

      if (matchesAll) {
        matches.push(model);
      }
    }

    return matches;
  }

  private async chooseModel(
    context: ExtensionCommandContext,
    models: string[],
    input: string,
  ): Promise<ModelSelection> {
    if (!input) {
      const choice = await context.ui.select(ADVISOR_MESSAGES.title, [DISABLED_OPTION, ...models]);
      if (choice === undefined) {
        return { kind: "cancelled" };
      }
      if (choice === DISABLED_OPTION) {
        return { kind: "disabled" };
      }
      return { kind: "selected", model: choice };
    }

    const matches = this.matchModels(models, input);
    if (matches.length === 0) {
      context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error");
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
    context.ui.notify(
      "Mais de um modelo corresponde; informe uma referência mais específica.",
      "warning",
    );
    return { kind: "cancelled" };
  }

  async handle(args: string, context: ExtensionCommandContext): Promise<void> {
    this.models = this.modelRefs(context);
    const status = this.advisor.status();
    const input = args.trim();

    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }

    if (input === "off") {
      this.notifyStatus(context, this.advisor.disable(), ADVISOR_MESSAGES.disabled);
      return;
    }
    const [command, ...argumentsList] = input.split(/\s+/);
    if (command === "thinking") {
      this.changeThinking(context, argumentsList.join(" "));
      return;
    }
    if (!input && !context.hasUI) {
      context.ui.notify(
        `Advisor: ${status.config.model ?? "desligado"}, thinking ${status.config.thinking}`,
        "info",
      );
      return;
    }

    const chosen = await this.chooseModel(context, this.modelRefs(context), input);
    if (chosen.kind === "disabled") {
      this.notifyStatus(context, this.advisor.disable(), ADVISOR_MESSAGES.disabled);
    } else if (chosen.kind === "selected") {
      this.notifyStatus(
        context,
        this.advisor.selectModel(chosen.model),
        `Advisor: ${chosen.model}`,
      );
    }
  }
}

export function registerCommand(pi: ExtensionAPI, advisor: Advisor): void {
  const command = new AdvisorCommand(pi, advisor);
  pi.on("session_start", command.start.bind(command));
  pi.registerCommand("advisor", {
    description: "Escolhe o modelo advisor ou o nível de raciocínio",
    getArgumentCompletions: command.completions.bind(command),
    handler: command.handle.bind(command),
  });
}
