import { type Advisor } from "#synapse/modules"
import { type AdvisorContext, type AdvisorHost } from "../contracts"
import { syncAdvisor } from "../sync"

export function applyThinking(pi: AdvisorHost, advisor: Advisor, context: AdvisorContext, level: string): void {
  const result = advisor.configuration.setThinking(level)
  if (result.kind === "failure") {
    context.ui.notify(result.message, "error")
    return
  }
  syncAdvisor(pi, advisor, context)
  context.ui.notify(`Advisor thinking: ${level}`, "info")
}
