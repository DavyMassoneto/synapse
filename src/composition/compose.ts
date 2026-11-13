import {
  advisorConfigPath,
  registerAdvisor,
  registerCooldownRetry,
  registerModelRouter,
  registerResponseRules,
  responseRulesInstructionsPath,
} from "#synapse/integration"
import { createAdvisor, createModelRouter } from "#synapse/modules"
import { type SynapseHost } from "./types"

export function compose(pi: SynapseHost): void {
  const controller = new AbortController()
  registerAdvisor(
    pi,
    createAdvisor(advisorConfigPath()),
    controller.signal,
    controller.abort.bind(controller, undefined),
  )
  registerCooldownRetry(pi)
  registerResponseRules(pi, responseRulesInstructionsPath())
  registerModelRouter(pi, createModelRouter)
}
