import {
  CAPABILITY_RULES_PRESENT,
  CAPABILITY_RULES_PROBE,
  CapabilityPresence,
  registerResponseRules,
  responseRulesInstructionsPath,
} from "#synapse/integration"
import { type SynapseRulesHost } from "./types"

export function composeResponseRules(pi: SynapseRulesHost): void {
  const presence = new CapabilityPresence(pi, CAPABILITY_RULES_PRESENT)
  if (!presence.collect(CAPABILITY_RULES_PROBE)) {
    registerResponseRules(pi, responseRulesInstructionsPath())
    pi.events.on(CAPABILITY_RULES_PROBE, presence.answer.bind(presence))
  }
}
