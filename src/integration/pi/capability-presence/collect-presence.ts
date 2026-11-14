import {
  CAPABILITY_COOLDOWN_PRESENT,
  CAPABILITY_COOLDOWN_PROBE,
  CAPABILITY_ROUTER_PRESENT,
  CAPABILITY_ROUTER_PROBE,
  CAPABILITY_RULES_PRESENT,
  CAPABILITY_RULES_PROBE,
} from "./constants"
import { CapabilityPresence } from "./presence"
import { type CapabilityPresenceHost, type PresentCapabilities } from "./types"

export function collectPresentCapabilities(host: CapabilityPresenceHost): PresentCapabilities {
  return {
    cooldownRetry: new CapabilityPresence(host, CAPABILITY_COOLDOWN_PRESENT).collect(CAPABILITY_COOLDOWN_PROBE),
    responseRules: new CapabilityPresence(host, CAPABILITY_RULES_PRESENT).collect(CAPABILITY_RULES_PROBE),
    modelRouter: new CapabilityPresence(host, CAPABILITY_ROUTER_PRESENT).collect(CAPABILITY_ROUTER_PROBE),
  }
}
