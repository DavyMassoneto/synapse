import { ADVISOR_NAME } from "#synapse/integration/pi/advisor/identifiers.js";
import { type AdvisorContext } from "#synapse/integration/pi/advisor/index.js";

export function updateAdvisorStatus(context: AdvisorContext, model: string | undefined): void {
  if (context.hasUI) {
    context.ui.setStatus(ADVISOR_NAME, model ? `advisor: ${model}` : undefined);
  }
}
