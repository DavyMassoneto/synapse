import type { Advisor, AdvisorResult } from "#synapse/modules";
import type { AdvisorContext, AdvisorHost } from "../contracts";
import { COMMAND_TEXT } from "../presentation";
import { syncAdvisor } from "../sync";
import type { ModelSelection } from "./selection-types";

export function applySelection(
  pi: AdvisorHost,
  advisor: Advisor,
  context: AdvisorContext,
  selection: ModelSelection,
): void {
  let result: AdvisorResult;
  let message: string;
  if (selection.kind === "disabled") {
    result = advisor.configuration.disable();
    message = COMMAND_TEXT.disabled;
  } else if (selection.kind === "selected") {
    result = advisor.configuration.selectModel(selection.model);
    message = `Advisor: ${selection.model}`;
  } else {
    return;
  }
  if (result.kind === "failure") {
    context.ui.notify(result.message, "error");
    return;
  }
  syncAdvisor(pi, advisor, context);
  context.ui.notify(message, "info");
}
