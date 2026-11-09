import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { type AdvisorToolActivation, syncAdvisor } from "../lifecycle"

export function applyThinking(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  context: AdvisorContext,
  level: string,
): void {
  const result = advisor.configuration.setThinking(level)
  if (result.kind === "failure") {
    context.ui.notify(result.message, "error")
    return
  }
  syncAdvisor(pi, advisor, context)
  context.ui.notify(`Advisor thinking: ${level}`, "info")
}
