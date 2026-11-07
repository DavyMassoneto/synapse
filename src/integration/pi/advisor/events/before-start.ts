import type { BeforeAgentStartEvent } from "@earendil-works/pi-coding-agent";
import type { Advisor } from "#synapse/modules";
import type { AdvisorContext, AdvisorHost } from "../contracts";
import { syncAdvisor } from "../sync";

export function beforeStart(
  pi: AdvisorHost,
  advisor: Advisor,
  event: BeforeAgentStartEvent,
  context: AdvisorContext,
): undefined {
  syncAdvisor(pi, advisor, context);
  if (advisor.isEnabled()) {
    event.systemPromptOptions.sections.advisor = advisor.consultationInstructions;
  } else {
    delete event.systemPromptOptions.sections.advisor;
  }
}
