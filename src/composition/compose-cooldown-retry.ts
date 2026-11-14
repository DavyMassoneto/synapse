import {
  CAPABILITY_COOLDOWN_PRESENT,
  CAPABILITY_COOLDOWN_PROBE,
  CapabilityPresence,
  registerCooldownRetry,
} from "#synapse/integration"
import { type SynapseCooldownHost } from "./types"

export function composeCooldownRetry(pi: SynapseCooldownHost): void {
  const presence = new CapabilityPresence(pi, CAPABILITY_COOLDOWN_PRESENT)
  if (!presence.collect(CAPABILITY_COOLDOWN_PROBE)) {
    registerCooldownRetry(pi)
    pi.events.on(CAPABILITY_COOLDOWN_PROBE, presence.answer.bind(presence))
  }
}
