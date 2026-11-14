import {
  type AgentTeamMemberExtensions,
  type CapabilityPresenceHost,
  collectPresentCapabilities,
} from "#synapse/integration"
import { composeCooldownRetry } from "./compose-cooldown-retry"
import { composeModelRouter } from "./compose-model-router"
import { composeResponseRules } from "./compose-response-rules"

export function selectMemberFactories(host: CapabilityPresenceHost): ReturnType<AgentTeamMemberExtensions> {
  const present = collectPresentCapabilities(host)
  const factories: ReturnType<AgentTeamMemberExtensions> = []
  if (present.cooldownRetry) {
    factories.push(composeCooldownRetry)
  }
  if (present.responseRules) {
    factories.push(composeResponseRules)
  }
  if (present.modelRouter) {
    factories.push(composeModelRouter)
  }
  return factories
}
