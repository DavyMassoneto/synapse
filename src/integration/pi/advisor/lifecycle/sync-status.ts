import { ADVISOR_NAME, type AdvisorContext, type OptionalModel } from "../host"
import { STATUS_PREFIX } from "./constants"

export function updateAdvisorStatus(context: AdvisorContext, model: OptionalModel): void {
  if (context.hasUI) {
    if (model) {
      context.ui.setStatus(ADVISOR_NAME, `${STATUS_PREFIX}${model}`)
    } else {
      context.ui.setStatus(ADVISOR_NAME, undefined)
    }
  }
}
