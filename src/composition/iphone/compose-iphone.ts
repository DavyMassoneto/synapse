import { mountIphoneDependencies, registerIphone } from "#synapse/integration/pi/iphone"
import { createIphone } from "#synapse/modules/iphone"
import { type SynapseIphoneHost } from "./types"

export function composeIphone(pi: SynapseIphoneHost): void {
  registerIphone(pi, createIphone(mountIphoneDependencies(pi)))
}
