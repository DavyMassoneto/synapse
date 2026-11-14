import { CAPABILITY_ROUTER_PRESENT, CAPABILITY_ROUTER_PROBE, registerModelRouter } from "#synapse/integration"
import { createModelRouter } from "#synapse/modules"
import { mountCapability } from "./mount-capability"
import { type SynapseRouterHost } from "./types"

export function composeModelRouter(pi: SynapseRouterHost): void {
  mountCapability(
    pi,
    CAPABILITY_ROUTER_PROBE,
    CAPABILITY_ROUTER_PRESENT,
    registerModelRouter.bind(undefined, pi, createModelRouter),
  )
}
