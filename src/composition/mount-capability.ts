import { CapabilityPresence, type CapabilityPresenceHost } from "#synapse/integration"
import { type SynapseCapabilityMount } from "./types"

export function mountCapability(
  host: CapabilityPresenceHost,
  probe: string,
  present: string,
  mount: SynapseCapabilityMount,
): void {
  const presence = new CapabilityPresence(host, present)
  if (!presence.collect(probe)) {
    mount()
    host.events.on(probe, presence.answer.bind(presence))
  }
}
