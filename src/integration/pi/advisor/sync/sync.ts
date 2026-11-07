import type { Advisor } from "#synapse/modules";
import type { AdvisorContext } from "../contracts";
import { updateAdvisorStatus } from "./status";
import { updateAdvisorTool } from "./tool-state";
import type { AdvisorToolActivation } from "./types";

export function syncAdvisor(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  context: AdvisorContext,
): void {
  const result = advisor.configuration.status();
  let model: string | undefined;
  if (result.kind === "success") {
    model = result.config.model;
  }
  updateAdvisorTool(pi, advisor.isEnabled(result));
  updateAdvisorStatus(context, model);
}
