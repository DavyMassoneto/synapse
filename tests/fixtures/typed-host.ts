import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type AdvisorBeforeStartHandler,
  type AdvisorCommandDefinition,
  type AdvisorHost,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorTool,
  type AdvisorToolResultHandler,
  type AdvisorTurnEndHandler,
  registerAdvisor,
} from "#synapse/integration/index.js";
import { type Advisor, createAdvisor } from "#synapse/modules/index.js";
import { type AdvisorEventRegistration } from "./typed-host-types.ts";

export class AdvisorHostCollector implements AdvisorHost {
  readonly starts: AdvisorSessionStartHandler[] = [];
  readonly shutdowns: AdvisorShutdownHandler[] = [];
  readonly beforeStarts: AdvisorBeforeStartHandler[] = [];
  readonly toolResults: AdvisorToolResultHandler[] = [];
  readonly turns: AdvisorTurnEndHandler[] = [];
  tool: AdvisorTool | undefined;
  command: AdvisorCommandDefinition | undefined;
  active: string[] = [];

  on(event: "session_start", handler: AdvisorSessionStartHandler): () => void;
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): () => void;
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): () => void;
  on(event: "tool_result", handler: AdvisorToolResultHandler): () => void;
  on(event: "turn_end", handler: AdvisorTurnEndHandler): () => void;
  on(...registration: AdvisorEventRegistration): () => void {
    switch (registration[0]) {
      case "session_start":
        this.starts.push(registration[1]);
        break;
      case "session_shutdown":
        this.shutdowns.push(registration[1]);
        break;
      case "before_agent_start":
        this.beforeStarts.push(registration[1]);
        break;
      case "tool_result":
        this.toolResults.push(registration[1]);
        break;
      case "turn_end":
        this.turns.push(registration[1]);
        break;
    }
    return this.unsubscribe;
  }

  unsubscribe(): void {}
  registerTool(tool: AdvisorTool): void {
    this.tool = tool;
  }
  registerCommand(_name: string, command: AdvisorCommandDefinition): void {
    this.command = command;
  }
  getActiveTools(): string[] {
    return this.active;
  }
  setActiveTools(names: string[]): void {
    this.active = names;
  }
}

export class TypedAdvisorHost extends AdvisorHostCollector {
  readonly directory = mkdtempSync(join(tmpdir(), "synapse-host-"));
  readonly lifetime = new AbortController();
  readonly advisor: Advisor;

  constructor() {
    super();
    writeFileSync(
      join(this.directory, "advisor.json"),
      JSON.stringify({ model: "provider/model", thinking: "low" }),
    );
    this.advisor = createAdvisor(join(this.directory, "advisor.json"));
    registerAdvisor(
      this,
      this.advisor,
      this.lifetime.signal,
      this.lifetime.abort.bind(this.lifetime),
    );
  }

  cleanup(): void {
    rmSync(this.directory, { recursive: true, force: true });
  }
}
