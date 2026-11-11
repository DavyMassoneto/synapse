import { type BeforeAgentStartEvent, type TurnEndEvent } from "@earendil-works/pi-coding-agent"
import {
  type AdvisorBeforeStartHandler,
  type AdvisorCommandDefinition,
  type AdvisorContext,
  type AdvisorHost,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorTool,
  type AdvisorTurnEndHandler,
  type Unsubscribe,
} from "#synapse/integration"
import { type AdvisorEventRegistration, type CommandCompletions, type TurnEndResult } from "./types"

export class AdvisorHostCollector implements AdvisorHost {
  readonly starts: AdvisorSessionStartHandler[] = []
  readonly shutdowns: AdvisorShutdownHandler[] = []
  readonly beforeStarts: AdvisorBeforeStartHandler[] = []
  readonly turns: AdvisorTurnEndHandler[] = []
  active: string[] = []
  private $tool?: AdvisorTool
  private $command?: AdvisorCommandDefinition

  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
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
      case "turn_end":
        this.turns.push(registration[1])
        break
    }
    return this.unsubscribe
  }

  unsubscribe(): void {}

  async emitSessionStart(context: AdvisorContext): Promise<void> {
    for (const handler of this.starts) {
      await handler({ type: "session_start", reason: "startup" }, context)
    }
  }

  async emitShutdown(context: AdvisorContext): Promise<void> {
    for (const handler of this.shutdowns) {
      await handler({ type: "session_shutdown", reason: "quit" }, context)
    }
  }

  async emitBeforeStart(event: BeforeAgentStartEvent, context: AdvisorContext): Promise<void> {
    for (const handler of this.beforeStarts) {
      await handler(event, context)
    }
  }

  async emitTurnEnd(event: TurnEndEvent, context: AdvisorContext): Promise<TurnEndResult[]> {
    const results: TurnEndResult[] = []
    for (const handler of this.turns) {
      results.push(await handler(event, context))
    }
    return results
  }

  async emitTurnEnds(event: TurnEndEvent, context: AdvisorContext, turns: number): Promise<TurnEndResult[]> {
    const results: TurnEndResult[] = []
    for (let turn = 0; turn < turns; turn++) {
      results.push(...(await this.emitTurnEnd(event, context)))
    }
    return results
  }

  requireTool(): AdvisorTool {
    if (this.$tool) {
      return this.$tool
    }
    throw new Error("ferramenta ausente")
  }

  requireCommand(): AdvisorCommandDefinition {
    if (this.$command) {
      return this.$command
    }
    throw new Error("comando ausente")
  }

  requireCompletions(): CommandCompletions {
    const command = this.requireCommand()
    if (command.getArgumentCompletions) {
      return command.getArgumentCompletions
    }
    throw new Error("autocomplete ausente")
  }

  registerTool(tool: AdvisorTool): void {
    this.$tool = tool
  }

  registerCommand(_name: string, command: AdvisorCommandDefinition): void {
    this.$command = command
  }

  getActiveTools(): string[] {
    return this.active
  }

  setActiveTools(names: string[]): void {
    this.active = names
  }
}
