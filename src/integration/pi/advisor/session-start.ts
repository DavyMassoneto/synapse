import type { SessionStartEvent } from "@earendil-works/pi-coding-agent";
import type { Advisor } from "#synapse/modules";
import type { ModelCatalog } from "./command";
import type { AdvisorContext, AdvisorHost } from "./contracts";
import { sessionStart } from "./events";

export function startAdvisorSession(
  pi: AdvisorHost,
  advisor: Advisor,
  catalog: ModelCatalog,
  event: SessionStartEvent,
  context: AdvisorContext,
): void {
  catalog.refresh(event, context);
  sessionStart(pi, advisor, event, context);
}
