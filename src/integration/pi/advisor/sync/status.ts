import { ADVISOR_NAME } from "../constants"
import { type AdvisorContext, type OptionalModel } from "../contracts"
import { STATUS_PREFIX } from "../presentation"

export function updateAdvisorStatus(context: AdvisorContext, model: OptionalModel): void {
  if (context.hasUI) {
    if (model) {
      context.ui.setStatus(ADVISOR_NAME, `${STATUS_PREFIX}${model}`)
    } else {
      context.ui.setStatus(ADVISOR_NAME, undefined)
    }
  }
}
