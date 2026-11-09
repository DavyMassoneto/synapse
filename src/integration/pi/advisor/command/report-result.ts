import { type Advisor, type AdvisorResult } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { type AdvisorToolActivation, syncAdvisor } from "../lifecycle"

export function reportResult(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  context: AdvisorContext,
  result: AdvisorResult,
  success: string,
): void {
  if (result.kind === "failure") {
    context.ui.notify(result.message, "error")
  } else {
    syncAdvisor(pi, advisor, context)
    context.ui.notify(success, "info")
  }
}
