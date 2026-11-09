import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { setAdvisorToolEnabled } from "./set-advisor-tool-enabled"
import { type AdvisorToolActivation } from "./types"
import { updateAdvisorStatus } from "./update-advisor-status"

export function syncAdvisor(pi: AdvisorToolActivation, advisor: Advisor, context: AdvisorContext): void {
  const result = advisor.configuration.status()
  setAdvisorToolEnabled(pi, advisor.isEnabled())
  updateAdvisorStatus(context, result)
}
