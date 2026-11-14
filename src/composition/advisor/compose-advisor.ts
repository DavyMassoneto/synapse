import { type AdvisorHost, advisorConfigPath, registerAdvisor } from "#synapse/integration/pi/advisor"
import { createAdvisor } from "#synapse/modules/advisor"

export function composeAdvisor(pi: AdvisorHost): void {
  const controller = new AbortController()
  registerAdvisor(
    pi,
    createAdvisor(advisorConfigPath()),
    controller.signal,
    controller.abort.bind(controller, undefined),
  )
}
