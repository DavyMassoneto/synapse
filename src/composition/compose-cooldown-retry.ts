import { CAPABILITY_COOLDOWN_PRESENT, CAPABILITY_COOLDOWN_PROBE, registerCooldownRetry } from "#synapse/integration"
import { mountCapability } from "./mount-capability"
import { type SynapseCooldownHost } from "./types"

export function composeCooldownRetry(pi: SynapseCooldownHost): void {
  mountCapability(pi, CAPABILITY_COOLDOWN_PROBE, CAPABILITY_COOLDOWN_PRESENT, registerCooldownRetry.bind(undefined, pi))
}
