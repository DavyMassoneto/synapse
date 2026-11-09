import { type SessionStartEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { type ModelCatalog } from "./command"
import { type AdvisorContext } from "./host"
import { type AdvisorToolActivation, sessionStart } from "./lifecycle"

export function startAdvisorSession(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  catalog: ModelCatalog,
  _event: SessionStartEvent,
  context: AdvisorContext,
): void {
  catalog.refresh(context)
  sessionStart(pi, advisor, context)
}
