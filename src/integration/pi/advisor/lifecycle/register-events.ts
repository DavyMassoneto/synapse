import { type Advisor } from "#synapse/modules"
import { ReminderEvents } from "./reminder-events"
import { SessionSync } from "./session-sync"
import { type AdvisorShutdownHandler, type LifecycleHost } from "./types"

export function registerEvents(pi: LifecycleHost, advisor: Advisor, shutdown: AdvisorShutdownHandler): void {
  const sync = new SessionSync(pi, advisor)
  const reminder = new ReminderEvents(advisor)
  pi.on("session_start", reminder.sessionStart.bind(reminder))
  pi.on("session_start", sync.sessionStart.bind(sync))
  pi.on("session_shutdown", shutdown)
  pi.on("before_agent_start", sync.beforeStart.bind(sync))
  pi.on("tool_result", reminder.toolResult.bind(reminder))
  pi.on("turn_end", reminder.turnEnd.bind(reminder))
}
