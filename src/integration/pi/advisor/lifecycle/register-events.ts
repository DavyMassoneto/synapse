import { type Advisor } from "#synapse/modules"
import { beforeStart } from "./before-start"
import { sessionStart } from "./session-start"
import { toolResult } from "./tool-result"
import { turnEnd } from "./turn-end"
import { type AdvisorShutdownHandler, type LifecycleHost } from "./types"

export function registerEvents(pi: LifecycleHost, advisor: Advisor, shutdown: AdvisorShutdownHandler): void {
  pi.on("session_start", sessionStart.bind(undefined, pi, advisor))
  pi.on("session_shutdown", shutdown)
  pi.on("before_agent_start", beforeStart.bind(undefined, pi, advisor))
  pi.on("tool_result", toolResult.bind(undefined, advisor))
  pi.on("turn_end", turnEnd.bind(undefined, advisor))
}
