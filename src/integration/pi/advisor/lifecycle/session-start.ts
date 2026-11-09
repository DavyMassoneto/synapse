import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { syncAdvisor } from "./sync-advisor"
import { type AdvisorToolActivation } from "./types"

export function sessionStart(pi: AdvisorToolActivation, advisor: Advisor, context: AdvisorContext): void {
  advisor.reminder.reset()
  syncAdvisor(pi, advisor, context)
  const status = advisor.configuration.status()
  if (status.kind === "failure" && context.hasUI) {
    context.ui.notify(status.message, "error")
  }
}
