import { type AdvisorContext, type AdvisorHost } from "@/integration/pi/advisor";
import { type Advisor } from "@/modules";
import { updateAdvisorStatus } from "./status.ts";
import { updateAdvisorTool } from "./tool-state.ts";

export function syncAdvisor(
  pi: Pick<AdvisorHost, "getActiveTools" | "setActiveTools">,
  advisor: Advisor,
  context: AdvisorContext,
): void {
  const result = advisor.status();
  const model = result.kind === "success" ? result.config.model : undefined;
  updateAdvisorTool(pi, Boolean(model));
  updateAdvisorStatus(context, model);
}
