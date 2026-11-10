import { advisorConfigPath, compose } from "./composition"
import { type AdvisorHost } from "./integration"

export default function registerSynapse(pi: AdvisorHost): void {
  compose(pi, advisorConfigPath())
}
