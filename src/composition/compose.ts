import {
  advisorConfigPath,
  mountIphoneDependencies,
  registerAdvisor,
  registerAgentTeam,
  registerIphone,
} from "#synapse/integration"
import { createAdvisor, createAgentTeam, createIphone } from "#synapse/modules"
import { composeMember } from "./compose-member"
import { type SynapseHost } from "./types"

export function compose(pi: SynapseHost): void {
  const controller = new AbortController()
  registerAdvisor(
    pi,
    createAdvisor(advisorConfigPath()),
    controller.signal,
    controller.abort.bind(controller, undefined),
  )
  composeMember(pi)
  registerAgentTeam(pi, createAgentTeam, composeMember)
  registerIphone(pi, createIphone(mountIphoneDependencies(pi)))
}
