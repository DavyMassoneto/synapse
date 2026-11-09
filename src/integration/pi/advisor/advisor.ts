import { type Advisor } from "#synapse/modules"
import { ModelCatalog, registerCommand } from "./command"
import { type AdvisorHost, type AdvisorShutdownHandler } from "./contracts"
import { registerEvents } from "./events"
import { startAdvisorSession } from "./session-start"
import { registerTool } from "./tool"

export function registerAdvisor(
  pi: AdvisorHost,
  advisor: Advisor,
  signal: AbortSignal,
  shutdown: AdvisorShutdownHandler,
): void {
  const catalog = new ModelCatalog()
  pi.on("session_start", startAdvisorSession.bind(undefined, pi, advisor, catalog))
  registerEvents(pi, advisor, shutdown)
  registerTool(pi, advisor, signal)
  registerCommand(pi, advisor, catalog)
}
