import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Advisor } from "@/modules";

export function syncAdvisor(pi: ExtensionAPI, advisor: Advisor, context: ExtensionContext): void {
  const model = advisor.config.load().model;
  const active = pi.getActiveTools();

  if (model && !active.includes("advisor")) {
    pi.setActiveTools([...active, "advisor"]);
  } else if (!model && active.includes("advisor")) {
    pi.setActiveTools(active.filter((name) => name !== "advisor"));
  }

  if (context.hasUI) {
    context.ui.setStatus("advisor", model ? `advisor: ${model}` : undefined);
  }
}

export function registerEvents(
  pi: ExtensionAPI,
  advisor: Advisor,
  lifetime: AbortController,
): void {
  pi.on("session_start", (_event, context) => {
    advisor.reset();
    syncAdvisor(pi, advisor, context);
  });

  pi.on("session_shutdown", () => lifetime.abort());
  pi.on("before_agent_start", (event, context) => {
    syncAdvisor(pi, advisor, context);
    if (advisor.config.load().model) {
      event.systemPromptOptions.sections.advisor = advisor.timing;
    } else {
      delete event.systemPromptOptions.sections.advisor;
    }
  });

  pi.on("tool_result", (event) => {
    if (event.toolName === "advisor") {
      advisor.reset();
    }
  });

  pi.on("turn_end", (event) => {
    const reminder = advisor.turn(event.outcome === "completed", event.toolResults.length > 0);
    if (reminder) {
      return {
        entries: [
          ...event.entries,
          {
            type: "custom_message",
            customType: "advisor-lembrete",
            content: reminder,
            display: false,
          },
        ],
      };
    }
  });
}
