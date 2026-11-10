import { type AdvisorHost, registerAdvisor } from "#synapse/integration"
import { createAdvisor } from "#synapse/modules/advisor/public"

export function compose(pi: AdvisorHost, configPath: string): void {
  const controller = new AbortController()
  registerAdvisor(pi, createAdvisor(configPath), controller.signal, () => controller.abort())
}
