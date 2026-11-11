import { compose } from "./composition"
import { type AdvisorHost, advisorConfigPath } from "./integration"

export default function registerSynapse(pi: AdvisorHost): void {
  compose(pi, advisorConfigPath())
}
