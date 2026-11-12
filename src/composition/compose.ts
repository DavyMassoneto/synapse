import {
  advisorConfigPath,
  createComputerUseHostDependencies,
  mountIphoneDependencies,
  registerAdvisor,
  registerAgentTeam,
  registerComputerUse,
  registerIphone,
} from "#synapse/integration"
import { createAdvisor, createAgentTeam, createComputerUse, createIphone } from "#synapse/modules"
import { composeMember } from "./compose-member"
import { type SynapseHost } from "./types"

export function compose(pi: SynapseHost): void {
  const controller = new AbortController()
  registerAdvisor(pi, createAdvisor(advisorConfigPath()), controller.signal, () => controller.abort())
  composeMember(pi)
  registerAgentTeam(pi, createAgentTeam, composeMember)
  registerComputerUse(pi, createComputerUse(createComputerUseHostDependencies()))
  registerIphone(pi, createIphone(mountIphoneDependencies(pi)))
}
