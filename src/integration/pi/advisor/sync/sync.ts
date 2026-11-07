import type { Advisor } from "#synapse/modules";
import type { AdvisorContext } from "../contracts";
import { updateAdvisorStatus } from "./status.ts";
import { updateAdvisorTool } from "./tool-state.ts";
import type { AdvisorToolActivation } from "./types.ts";

export function syncAdvisor(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  context: AdvisorContext,
): void {
  const result = advisor.status();
  const model = result.kind === "success" ? result.config.model : undefined;
  updateAdvisorTool(pi, advisor.isEnabled());
  updateAdvisorStatus(context, model);
}
