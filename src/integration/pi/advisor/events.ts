import {
  type BeforeAgentStartEvent,
  type SessionStartEvent,
  type ToolResultEvent,
  type TurnEndEvent,
  type TurnEndEventResult,
} from "@earendil-works/pi-coding-agent";
import { type Advisor } from "@/modules";
import { type AdvisorContext } from "./context-types.ts";
import { type AdvisorHost } from "./host-types.ts";

export function syncAdvisor(pi: AdvisorHost, advisor: Advisor, context: AdvisorContext): void {
  const result = advisor.status();
  const model = result.kind === "success" ? result.config.model : undefined;
  const active = pi.getActiveTools();

  if (model && !active.includes("advisor")) {
    pi.setActiveTools([...active, "advisor"]);
  } else if (!model && active.includes("advisor")) {
    const remaining: string[] = [];
    for (const name of active) {
      if (name !== "advisor") {
        remaining.push(name);
      }
    }
    pi.setActiveTools(remaining);
  }

  if (context.hasUI) {
    context.ui.setStatus("advisor", model ? `advisor: ${model}` : undefined);
  }
}

class AdvisorEvents {
  constructor(
    private readonly pi: AdvisorHost,
    private readonly advisor: Advisor,
    private readonly shutdownCallback: () => void,
  ) {}

  start(_event: SessionStartEvent, context: AdvisorContext): void {
    this.advisor.reset();
    syncAdvisor(this.pi, this.advisor, context);
    const status = this.advisor.status();
    if (status.kind === "failure" && context.hasUI) {
      context.ui.notify(status.message, "error");
    }
  }

  shutdown(): void {
    this.shutdownCallback();
  }

  beforeStart(event: BeforeAgentStartEvent, context: AdvisorContext): undefined {
    syncAdvisor(this.pi, this.advisor, context);
    const result = this.advisor.status();
    if (result.kind === "success" && result.config.model) {
      event.systemPromptOptions.sections.advisor = this.advisor.timing;
    } else {
      delete event.systemPromptOptions.sections.advisor;
    }
    return undefined;
  }

  toolResult(event: ToolResultEvent): undefined {
    if (event.toolName === "advisor") {
      this.advisor.reset();
    }
    return undefined;
  }

  turnEnd(event: TurnEndEvent): TurnEndEventResult | undefined {
    const reminder = this.advisor.turn({
      completed: event.outcome === "completed",
      usedTools: event.toolResults.length > 0,
    });
    if (!reminder) {
      return undefined;
    }
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
  pi: AdvisorHost,
  advisor: Advisor,
  shutdownCallback: () => void,
): void {
  const handlers = new AdvisorEvents(pi, advisor, shutdownCallback);
  pi.on("session_start", handlers.start.bind(handlers));
  pi.on("session_shutdown", handlers.shutdown.bind(handlers));
  pi.on("before_agent_start", handlers.beforeStart.bind(handlers));
  pi.on("tool_result", handlers.toolResult.bind(handlers));
  pi.on("turn_end", handlers.turnEnd.bind(handlers));
}
