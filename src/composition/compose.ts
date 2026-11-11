import { type AdvisorHost, advisorConfigPath, registerAdvisor } from "#synapse/integration"
import { createAdvisor } from "#synapse/modules"

export function compose(pi: AdvisorHost): void {
  const controller = new AbortController()
  registerAdvisor(pi, createAdvisor(advisorConfigPath()), controller.signal, () => controller.abort())
}
