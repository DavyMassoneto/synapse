import {
  type BeforeAgentStartEvent,
  type ExtensionAPI,
  type ExtensionContext,
  type SessionStartEvent,
  type ToolResultEvent,
  type TurnEndEvent,
  type TurnEndEventResult,
} from "@earendil-works/pi-coding-agent";
import { type Advisor } from "@/modules";

export function syncAdvisor(pi: ExtensionAPI, advisor: Advisor, context: ExtensionContext): void {
  const model = advisor.config.load().model;
  const active = pi.getActiveTools();

  if (model && !active.includes("advisor")) {
    pi.setActiveTools([...active, "advisor"]);
  } else if (!model && active.includes("advisor")) {
    const remaining: string[] = [];
    for (const name of active) {
      if (name !== "advisor") remaining.push(name);
    }
    pi.setActiveTools(remaining);
  }

  if (context.hasUI) {
    context.ui.setStatus("advisor", model ? `advisor: ${model}` : undefined);
  }
}

class AdvisorEvents {
  constructor(
    private readonly pi: ExtensionAPI,
    private readonly advisor: Advisor,
    private readonly lifetime: AbortController,
  ) {}

  start(_event: SessionStartEvent, context: ExtensionContext): void {
    this.advisor.reset();
    syncAdvisor(this.pi, this.advisor, context);
  }

  shutdown(): void {
    this.lifetime.abort();
  }

  beforeStart(event: BeforeAgentStartEvent, context: ExtensionContext): void {
    syncAdvisor(this.pi, this.advisor, context);
    if (this.advisor.config.load().model) {
      event.systemPromptOptions.sections.advisor = this.advisor.timing;
    } else {
      delete event.systemPromptOptions.sections.advisor;
    }
  }

  toolResult(event: ToolResultEvent): void {
    if (event.toolName === "advisor") this.advisor.reset();
  }

  turnEnd(event: TurnEndEvent): TurnEndEventResult | undefined {
    const reminder = this.advisor.turn(event.outcome === "completed", event.toolResults.length > 0);
    if (!reminder) return undefined;
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
}

export function registerEvents(
  pi: ExtensionAPI,
  advisor: Advisor,
  lifetime: AbortController,
): void {
  const handlers = new AdvisorEvents(pi, advisor, lifetime);
  pi.on("session_start", handlers.start.bind(handlers));
  pi.on("session_shutdown", handlers.shutdown.bind(handlers));
  pi.on("before_agent_start", handlers.beforeStart.bind(handlers));
  pi.on("tool_result", handlers.toolResult.bind(handlers));
  pi.on("turn_end", handlers.turnEnd.bind(handlers));
}
