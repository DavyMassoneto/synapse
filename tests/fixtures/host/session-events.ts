import { type BeforeAgentStartEvent, type TurnEndEvent } from "@earendil-works/pi-coding-agent"
import {
  type CollectedBeforeStart,
  type CollectedSessionShutdown,
  type CollectedSessionStart,
  type CollectedTurnEnd,
  type HostSessionRegistration,
  type TurnEndResult,
} from "./types"

export class HostSessionEvents<C> {
  readonly starts: CollectedSessionStart<C>[] = []

  readonly shutdowns: CollectedSessionShutdown<C>[] = []

  readonly beforeStarts: CollectedBeforeStart<C>[] = []

  readonly turns: CollectedTurnEnd<C>[] = []

  collect(registration: HostSessionRegistration<C>): void {
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
  }

  async emitSessionStart(context: C): Promise<void> {
    for (const handler of this.starts) {
      await handler({ type: "session_start", reason: "startup" }, context)
    }
  }

  async emitShutdown(context: C): Promise<void> {
    for (const handler of this.shutdowns) {
      await handler({ type: "session_shutdown", reason: "quit" }, context)
    }
  }

  async emitBeforeStart(event: BeforeAgentStartEvent, context: C): Promise<void> {
    for (const handler of this.beforeStarts) {
      await handler(event, context)
    }
  }

  async emitTurnEnd(event: TurnEndEvent, context: C): Promise<TurnEndResult[]> {
    const results: TurnEndResult[] = []
    for (const handler of this.turns) {
      results.push(await handler(event, context))
    }
    return results
  }
}
