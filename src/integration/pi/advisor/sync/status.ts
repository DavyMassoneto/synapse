import { ADVISOR_NAME } from "../constants";
import type { AdvisorContext } from "../contracts";

export function updateAdvisorStatus(context: AdvisorContext, model: string | undefined): void {
  if (context.hasUI) {
    if (model) {
      context.ui.setStatus(ADVISOR_NAME, `advisor: ${model}`);
    } else {
      context.ui.setStatus(ADVISOR_NAME, undefined);
    }
  }
}
