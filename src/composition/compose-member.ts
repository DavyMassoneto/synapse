import {
  registerCooldownRetry,
  registerModelRouter,
  registerResponseRules,
  responseRulesInstructionsPath,
} from "#synapse/integration"
import { createModelRouter } from "#synapse/modules"
import { type SynapseMemberHost } from "./types"

export function composeMember(pi: SynapseMemberHost): void {
  registerCooldownRetry(pi)
  registerResponseRules(pi, responseRulesInstructionsPath())
  registerModelRouter(pi, createModelRouter)
}
