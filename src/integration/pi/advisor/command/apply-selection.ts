import { type Advisor, type AdvisorResult } from "#synapse/modules"
import { type AdvisorContext, type AdvisorHost } from "../host"
import { syncAdvisor } from "../lifecycle"
import { type ModelSelection } from "../model-picker"
import { COMMAND_TEXT } from "./constants"

export function applySelection(
  pi: AdvisorHost,
  advisor: Advisor,
  context: AdvisorContext,
  selection: ModelSelection,
): void {
  let result: AdvisorResult
  let message: string
  if (selection.kind === "disabled") {
    result = advisor.configuration.disable()
    message = COMMAND_TEXT.disabled
  } else if (selection.kind === "selected") {
    result = advisor.configuration.selectModel(selection.model)
    message = `Advisor: ${selection.model}`
  } else {
    return
  }
  if (result.kind === "failure") {
    context.ui.notify(result.message, "error")
    return
  }
  syncAdvisor(pi, advisor, context)
  context.ui.notify(message, "info")
}
