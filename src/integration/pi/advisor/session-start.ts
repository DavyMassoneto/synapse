import { type SessionStartEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { type ModelCatalog } from "./command"
import { type AdvisorContext } from "./host"
import { type AdvisorToolActivation, sessionStart } from "./lifecycle"

export function startAdvisorSession(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  catalog: ModelCatalog,
  event: SessionStartEvent,
  context: AdvisorContext,
): void {
  catalog.refresh(event, context)
  sessionStart(pi, advisor, event, context)
}
