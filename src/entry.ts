import { advisorConfigPath, compose } from "./composition"
import { type AdvisorHost, registerAdvisor } from "./integration"

export default function registerSynapse(pi: AdvisorHost): void {
  const composition = compose(advisorConfigPath())
  registerAdvisor(pi, composition.advisor, composition.signal, composition.shutdown)
}
