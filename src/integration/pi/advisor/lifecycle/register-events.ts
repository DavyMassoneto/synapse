import { type Advisor } from "#synapse/modules"
import { BEFORE_AGENT_START, SESSION_SHUTDOWN, SESSION_START, TOOL_RESULT, TURN_END } from "./constants"
import { ReminderEvents } from "./reminder-events"
import { SessionSync } from "./session-sync"
import { type AdvisorShutdownHandler, type LifecycleHost } from "./types"

export function registerEvents(pi: LifecycleHost, advisor: Advisor, shutdown: AdvisorShutdownHandler): void {
  const sync = new SessionSync(pi, advisor)
  const reminder = new ReminderEvents(advisor)
  pi.on(SESSION_START, advisor.reminder.reset.bind(advisor.reminder))
  pi.on(SESSION_START, sync.sessionStart.bind(sync))
  pi.on(SESSION_SHUTDOWN, shutdown)
  pi.on(BEFORE_AGENT_START, sync.beforeStart.bind(sync))
  pi.on(TOOL_RESULT, reminder.toolResult.bind(reminder))
  pi.on(TURN_END, reminder.turnEnd.bind(reminder))
}
