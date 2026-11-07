import { ADVISOR_NAME } from "../constants";
import type { AdvisorContext } from "../contracts";

export function updateAdvisorStatus(context: AdvisorContext, model: string | undefined): void {
  if (context.hasUI) {
    context.ui.setStatus(ADVISOR_NAME, model ? `advisor: ${model}` : undefined);
  }
}
