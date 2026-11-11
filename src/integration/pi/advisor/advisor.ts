import { type Advisor } from "#synapse/modules"
import { registerCommand } from "./command"
import { type AdvisorShutdownHandler, registerEvents } from "./lifecycle"
import { registerTool } from "./tool-registration"
import { type AdvisorHost } from "./types"

export function registerAdvisor(
  pi: AdvisorHost,
  advisor: Advisor,
  signal: AbortSignal,
  shutdown: AdvisorShutdownHandler,
): void {
  registerEvents(pi, advisor, shutdown)
  registerTool(pi, advisor, signal)
  registerCommand(pi, advisor)
}
