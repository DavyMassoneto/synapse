import {
  advisorConfigPath,
  registerAdvisor,
  registerCooldownRetry,
  registerResponseRules,
  responseRulesInstructionsPath,
} from "#synapse/integration"
import { createAdvisor } from "#synapse/modules"
import { type SynapseHost } from "./types"

export function compose(pi: SynapseHost): void {
  const controller = new AbortController()
  registerAdvisor(pi, createAdvisor(advisorConfigPath()), controller.signal, () => controller.abort())
  registerCooldownRetry(pi)
  registerResponseRules(pi, responseRulesInstructionsPath())
}
