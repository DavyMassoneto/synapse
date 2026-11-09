import { type AdvisorResult, hasModel } from "#synapse/modules"
import { ADVISOR_NAME, type AdvisorContext } from "../host"
import { STATUS_PREFIX } from "./constants"

export function updateAdvisorStatus(context: AdvisorContext, result: AdvisorResult): void {
  if (context.hasUI && result.kind === "success" && hasModel(result.config)) {
    context.ui.setStatus(ADVISOR_NAME, `${STATUS_PREFIX}${result.config.model}`)
  } else if (context.hasUI) {
    context.ui.setStatus(ADVISOR_NAME, undefined)
  }
}
