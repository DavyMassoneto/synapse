import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../contracts"
import { configuredModel } from "./configured-model"
import { updateAdvisorStatus } from "./status"
import { updateAdvisorTool } from "./tool-state"
import { type AdvisorToolActivation } from "./types"

export function syncAdvisor(pi: AdvisorToolActivation, advisor: Advisor, context: AdvisorContext): void {
  const result = advisor.configuration.status()
  updateAdvisorTool(pi, advisor.isEnabled(result))
  updateAdvisorStatus(context, configuredModel(result))
}
