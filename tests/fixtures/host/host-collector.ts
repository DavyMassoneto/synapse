import { type TurnEndEvent } from "@earendil-works/pi-coding-agent"
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
import { HostSessionEvents } from "./session-events"
import { type AdvisorEventRegistration, type CommandCompletions, type TurnEndResult } from "./types"

export class AdvisorHostCollector implements AdvisorHost {
  private readonly events = new HostSessionEvents<AdvisorContext>()

  readonly starts = this.events.starts

  readonly shutdowns = this.events.shutdowns

  readonly beforeStarts = this.events.beforeStarts

  readonly turns = this.events.turns

  active: string[] = []

  private tool?: AdvisorTool
  private command?: AdvisorCommandDefinition

  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
  on(event: "turn_end", handler: AdvisorTurnEndHandler): Unsubscribe
  on(...registration: AdvisorEventRegistration): Unsubscribe {
    return this.collect(registration)
  }

  protected collect(registration: AdvisorEventRegistration): Unsubscribe {
    this.events.collect(registration)
    return this.unsubscribe
  }

  unsubscribe(): void {}

  readonly emitSessionStart = this.events.emitSessionStart.bind(this.events)

  readonly emitShutdown = this.events.emitShutdown.bind(this.events)

  readonly emitBeforeStart = this.events.emitBeforeStart.bind(this.events)

  readonly emitTurnEnd = this.events.emitTurnEnd.bind(this.events)

  async emitTurnEnds(event: TurnEndEvent, context: AdvisorContext, turns: number): Promise<TurnEndResult[]> {
    const results: TurnEndResult[] = []
    for (let turn = 0; turn < turns; turn++) {
      results.push(...(await this.emitTurnEnd(event, context)))
    }
    return results
  }

  requireTool(): AdvisorTool {
    if (this.tool) {
      return this.tool
    }
    throw new Error("ferramenta ausente")
  }

  requireCommand(): AdvisorCommandDefinition {
    if (this.command) {
      return this.command
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
