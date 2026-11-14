import { mountIphoneDependencies, registerIphone } from "#synapse/integration"
import { createIphone } from "#synapse/modules"
import { type SynapseIphoneHost } from "./types"

export function composeIphone(pi: SynapseIphoneHost): void {
  registerIphone(pi, createIphone(mountIphoneDependencies(pi)))
}
