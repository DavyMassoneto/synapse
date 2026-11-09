import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { type AdvisorToolActivation } from "../lifecycle"
import { type ModelSelection } from "../model-picker"
import { COMMAND_TEXT } from "./constants"
import { reportResult } from "./report-result"

export function applySelection(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  context: AdvisorContext,
  selection: ModelSelection,
): void {
  if (selection.kind === "disabled") {
    reportResult(pi, advisor, context, advisor.configuration.disable(), COMMAND_TEXT.disabled)
  }
  if (selection.kind === "selected") {
    const result = advisor.configuration.selectModel(selection.model)
    reportResult(pi, advisor, context, result, `Advisor: ${selection.model}`)
  }
}
