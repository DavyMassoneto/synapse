import { type AdvisorContext } from "@/integration/pi/advisor";
import { ADVISOR_NAME } from "@/integration/pi/advisor/identifiers";

export function updateAdvisorStatus(context: AdvisorContext, model: string | undefined): void {
  if (context.hasUI) {
    context.ui.setStatus(ADVISOR_NAME, model ? `advisor: ${model}` : undefined);
  }
}
