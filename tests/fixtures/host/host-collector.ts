import {
  type AdvisorBeforeStartHandler,
  type AdvisorCommandDefinition,
  type AdvisorHost,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorTool,
  type AdvisorToolResultHandler,
  type AdvisorTurnEndHandler,
  type Unsubscribe,
} from "#synapse/integration"
import { type AdvisorEventRegistration, type CommandCompletions } from "./types"

export class AdvisorHostCollector implements AdvisorHost {
  readonly starts: AdvisorSessionStartHandler[] = []
  readonly shutdowns: AdvisorShutdownHandler[] = []
  readonly beforeStarts: AdvisorBeforeStartHandler[] = []
  readonly toolResults: AdvisorToolResultHandler[] = []
  readonly turns: AdvisorTurnEndHandler[] = []
  active: string[] = []
  private tool?: AdvisorTool
  private command?: AdvisorCommandDefinition

  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
  on(event: "tool_result", handler: AdvisorToolResultHandler): Unsubscribe
  on(event: "turn_end", handler: AdvisorTurnEndHandler): Unsubscribe
  on(...registration: AdvisorEventRegistration): Unsubscribe {
    switch (registration[0]) {
      case "session_start":
        this.starts.push(registration[1])
        break
      case "session_shutdown":
        this.shutdowns.push(registration[1])
        break
      case "before_agent_start":
        this.beforeStarts.push(registration[1])
        break
      case "tool_result":
        this.toolResults.push(registration[1])
        break
      case "turn_end":
        this.turns.push(registration[1])
        break
    }
    return this.unsubscribe
  }

  unsubscribe(): void {}

  requireTool(): AdvisorTool {
    if (this.tool instanceof Object) {
      return this.tool
    }
    throw new Error("ferramenta ausente")
  }

  requireCommand(): AdvisorCommandDefinition {
    if (this.command instanceof Object) {
      return this.command
    }
    throw new Error("comando ausente")
  }

  requireCompletions(): CommandCompletions {
    const command = this.requireCommand()
    if (typeof command.getArgumentCompletions === "function") {
      return command.getArgumentCompletions
    }
    throw new Error("autocomplete ausente")
  }

  registerTool(tool: AdvisorTool): void {
    this.tool = tool
  }
  registerCommand(_name: string, command: AdvisorCommandDefinition): void {
    this.command = command
  }
  getActiveTools(): string[] {
    return this.active
  }
  setActiveTools(names: string[]): void {
    this.active = names
  }
}
