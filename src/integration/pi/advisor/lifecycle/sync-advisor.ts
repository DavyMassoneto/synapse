import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { updateAdvisorStatus } from "./sync-status"
import { setAdvisorToolEnabled } from "./tool-state"
import { type AdvisorToolActivation } from "./types"

export function syncAdvisor(pi: AdvisorToolActivation, advisor: Advisor, context: AdvisorContext): void {
  const result = advisor.configuration.status()
  setAdvisorToolEnabled(pi, advisor.isEnabled(result))
  updateAdvisorStatus(context, result)
}
