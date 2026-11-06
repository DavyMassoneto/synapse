import { type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { syncAdvisor } from "@/integration";
import { type Advisor, THINKING_LEVELS } from "@/modules";

function modelRefs(context: ExtensionContext): string[] {
  let models = context.modelRegistry.getAvailable();

  if (context.scopedModels.length > 0) {
    models = context.scopedModels.map((entry) => entry.model);
  }

  return models.map((model) => `${model.provider}/${model.id}`);
}

export function registerCommand(pi: ExtensionAPI, advisor: Advisor): void {
  let lastContext: ExtensionContext | undefined;

  pi.on("session_start", (_event, context) => {
    lastContext = context;
  });

  pi.registerCommand("advisor", {
    description: "Escolhe o modelo advisor ou o nível de raciocínio",
    getArgumentCompletions(prefix) {
      const models = lastContext ? modelRefs(lastContext) : [];
      return ["off", "thinking", ...models]
        .filter((value) => value.toLowerCase().startsWith(prefix.toLowerCase()))
        .slice(0, 40)
        .map((value) => ({ value, label: value }));
    },

    async handler(args, context) {
      lastContext = context;
      const config = advisor.config.load();
      const input = args.trim();

      const commit = (message: string): void => {
        advisor.config.save(config);
        syncAdvisor(pi, advisor, context);
        context.ui.notify(message, "info");
      };

      if (input === "off") {
        config.model = undefined;
        commit("Advisor desligado");
        return;
      }

      if (input.startsWith("thinking")) {
        const requestedLevel = input.slice(8).trim();
        const level = THINKING_LEVELS.find((candidate) => candidate === requestedLevel);
        if (level === undefined) {
          context.ui.notify(`Níveis: ${THINKING_LEVELS.join(", ")}`, "error");
          return;
        }

        config.thinking = level;
        commit(`Advisor thinking: ${level}`);
        return;
      }

      const models = modelRefs(context);
      let chosen: string | undefined;

      if (input) {
        const terms = input.toLowerCase().split(/\s+/);
        const exact = models.find((model) => model.toLowerCase() === input.toLowerCase());
        let matches = models.filter((model) =>
          terms.every((term) => model.toLowerCase().includes(term)),
        );

        if (exact) {
          matches = [exact];
        }

        if (matches.length === 0) {
          context.ui.notify(`Nenhum modelo casa com '${input}'`, "error");
          return;
        }

        if (matches.length === 1) {
          chosen = matches[0];
        } else if (context.hasUI) {
          chosen = await context.ui.select("Modelo advisor", matches.slice(0, 100));
        }
      } else if (context.hasUI) {
        chosen = await context.ui.select("Modelo advisor", ["(sem advisor)", ...models]);
        if (chosen === "(sem advisor)") {
          config.model = undefined;
          commit("Advisor desligado");
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
        commit(`Advisor: ${chosen}`);
      }
    },
  });
}
