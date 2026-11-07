import { ADVISOR_NAME } from "#synapse/integration/pi/advisor/constants";
import { type AdvisorContext } from "#synapse/integration/pi/advisor/contracts";

export function updateAdvisorStatus(context: AdvisorContext, model: string | undefined): void {
  if (context.hasUI) {
    context.ui.setStatus(ADVISOR_NAME, model ? `advisor: ${model}` : undefined);
  }
}
