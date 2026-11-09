import { type BeforeAgentStartEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { syncAdvisor } from "./sync-advisor"
import { type AdvisorToolActivation } from "./types"

export function beforeStart(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  event: BeforeAgentStartEvent,
  context: AdvisorContext,
): void {
  syncAdvisor(pi, advisor, context)
  if (advisor.isEnabled(advisor.configuration.status())) {
    event.systemPromptOptions.sections.advisor = advisor.consultationInstructions
  } else {
    delete event.systemPromptOptions.sections.advisor
  }
}
