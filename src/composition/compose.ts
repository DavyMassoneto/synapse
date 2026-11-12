import { advisorConfigPath, registerAdvisor, registerCooldownRetry } from "#synapse/integration"
import { createAdvisor } from "#synapse/modules"
import { type SynapseHost } from "./types"

export function compose(pi: SynapseHost): void {
  const controller = new AbortController()
  registerAdvisor(pi, createAdvisor(advisorConfigPath()), controller.signal, () => controller.abort())
  registerCooldownRetry(pi)
}
