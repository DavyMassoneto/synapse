import { type AdvisorContext } from "@/integration/pi/advisor";

export function updateAdvisorStatus(context: AdvisorContext, model: string | undefined): void {
  if (context.hasUI) {
    context.ui.setStatus("advisor", model ? `advisor: ${model}` : undefined);
  }
}
