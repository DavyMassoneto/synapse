import { type Advisor } from "#synapse/modules/advisor/public"
import { AdvisorEvents } from "./events"
import { type AdvisorShutdownHandler, type LifecycleHost } from "./types"

export function registerEvents(pi: LifecycleHost, advisor: Advisor, shutdown: AdvisorShutdownHandler): void {
  const events = new AdvisorEvents(pi, advisor)
  pi.on("session_start", events.sessionStart.bind(events))
  pi.on("session_shutdown", shutdown)
  pi.on("before_agent_start", events.beforeStart.bind(events))
  pi.on("tool_result", events.toolResult.bind(events))
  pi.on("turn_end", events.turnEnd.bind(events))
}
