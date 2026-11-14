import {
  CAPABILITY_RULES_PRESENT,
  CAPABILITY_RULES_PROBE,
  registerResponseRules,
  responseRulesInstructionsPath,
} from "#synapse/integration"
import { mountCapability } from "./mount-capability"
import { type SynapseRulesHost } from "./types"

export function composeResponseRules(pi: SynapseRulesHost): void {
  mountCapability(pi, CAPABILITY_RULES_PROBE, CAPABILITY_RULES_PRESENT, mountResponseRules.bind(undefined, pi))
}

function mountResponseRules(pi: SynapseRulesHost): void {
  registerResponseRules(pi, responseRulesInstructionsPath())
}
