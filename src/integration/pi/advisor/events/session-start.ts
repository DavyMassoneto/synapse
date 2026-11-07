import type { SessionStartEvent } from "@earendil-works/pi-coding-agent";
import type { Advisor } from "#synapse/modules";
import type { AdvisorContext, AdvisorHost } from "../contracts";
import { syncAdvisor } from "../sync";

export function sessionStart(
  pi: AdvisorHost,
  advisor: Advisor,
  _event: SessionStartEvent,
  context: AdvisorContext,
): void {
  advisor.reminder.reset();
  syncAdvisor(pi, advisor, context);
  const status = advisor.configuration.status();
  if (status.kind === "failure" && context.hasUI) {
    context.ui.notify(status.message, "error");
  }
}
