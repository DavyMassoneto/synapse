import {
  CAPABILITY_ROUTER_PRESENT,
  CAPABILITY_ROUTER_PROBE,
  CapabilityPresence,
  registerModelRouter,
} from "#synapse/integration"
import { createModelRouter } from "#synapse/modules"
import { type SynapseRouterHost } from "./types"

export function composeModelRouter(pi: SynapseRouterHost): void {
  const presence = new CapabilityPresence(pi, CAPABILITY_ROUTER_PRESENT)
  if (!presence.collect(CAPABILITY_ROUTER_PROBE)) {
    registerModelRouter(pi, createModelRouter)
    pi.events.on(CAPABILITY_ROUTER_PROBE, presence.answer.bind(presence))
  }
}
