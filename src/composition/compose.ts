import { type AdvisorHost, registerAdvisor } from "#synapse/integration"
import { createAdvisor } from "#synapse/modules/advisor/public"
import { type AdvisorComposition } from "./types"

export function compose(pi: AdvisorHost, configPath: string): AdvisorComposition {
  const controller = new AbortController()
  const advisor = createAdvisor(configPath)
  registerAdvisor(pi, advisor, controller.signal, () => controller.abort())
  return { advisor, signal: controller.signal }
}
