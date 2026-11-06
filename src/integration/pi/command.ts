import {
  type ExtensionAPI,
  type ExtensionCommandContext,
  type ExtensionContext,
  type SessionStartEvent,
} from "@earendil-works/pi-coding-agent";
import { syncAdvisor } from "@/integration";
import { type Advisor, type Config, THINKING_LEVELS } from "@/modules";

class AdvisorCommand {
  private lastContext: ExtensionContext | undefined;

  constructor(
    private readonly pi: ExtensionAPI,
    private readonly advisor: Advisor,
  ) {}

  start(_event: SessionStartEvent, context: ExtensionContext): void {
    this.lastContext = context;
  }

  modelRefs(context: ExtensionContext): string[] {
    const refs: string[] = [];
    if (context.scopedModels.length > 0) {
      for (const entry of context.scopedModels)
        refs.push(`${entry.model.provider}/${entry.model.id}`);
    } else {
      for (const model of context.modelRegistry.getAvailable())
        refs.push(`${model.provider}/${model.id}`);
    }
    return refs;
  }

  completions(prefix: string): { value: string; label: string }[] {
    const models = this.lastContext ? this.modelRefs(this.lastContext) : [];
    const items: { value: string; label: string }[] = [];
    for (const value of ["off", "thinking", ...models]) {
      if (value.toLowerCase().startsWith(prefix.toLowerCase())) items.push({ value, label: value });
      if (items.length === 40) break;
    }
    return items;
  }

  commit(context: ExtensionContext, config: Config, message: string): void {
    this.advisor.config.save(config);
    syncAdvisor(this.pi, this.advisor, context);
    context.ui.notify(message, "info");
  }

  async handle(args: string, context: ExtensionCommandContext): Promise<void> {
    this.lastContext = context;
    const config = this.advisor.config.load();
    const input = args.trim();
    if (input === "off") {
      config.model = undefined;
      this.commit(context, config, "Advisor desligado");
      return;
    }
    if (input.startsWith("thinking")) {
      const requested = input.slice(8).trim();
      for (const level of THINKING_LEVELS) {
        if (level === requested) {
          config.thinking = level;
          this.commit(context, config, `Advisor thinking: ${level}`);
          return;
        }
      }
      context.ui.notify(`Níveis: ${THINKING_LEVELS.join(", ")}`, "error");
      return;
    }

    const models = this.modelRefs(context);
    let chosen: string | undefined;
    if (input) {
      const search = input.toLowerCase();
      const terms = search.split(/\s+/);
      const matches: string[] = [];
      for (const model of models) {
        if (model.toLowerCase() === search) {
          matches.length = 0;
          matches.push(model);
          break;
        }
        let matchesAll = true;
        for (const term of terms) {
          if (!model.toLowerCase().includes(term)) matchesAll = false;
        }
        if (matchesAll) matches.push(model);
      }
      if (matches.length === 0) {
        context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error");
        return;
      }
      if (matches.length === 1) chosen = matches[0];
      else if (context.hasUI)
        chosen = await context.ui.select("Modelo advisor", matches.slice(0, 100));
    } else if (context.hasUI) {
      chosen = await context.ui.select("Modelo advisor", ["(sem advisor)", ...models]);
      if (chosen === "(sem advisor)") {
        config.model = undefined;
        this.commit(context, config, "Advisor desligado");
        return;
      }
    } else {
      context.ui.notify(
        `Advisor: ${config.model ?? "desligado"}, thinking ${config.thinking}`,
        "info",
      );
      return;
    }
    if (chosen) {
      config.model = chosen;
      this.commit(context, config, `Advisor: ${chosen}`);
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
