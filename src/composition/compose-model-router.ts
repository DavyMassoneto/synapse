import { type ModelRouterHost, registerModelRouter } from "#synapse/integration"
import { createModelRouter } from "#synapse/modules"

export function composeModelRouter(pi: ModelRouterHost): void {
  registerModelRouter(pi, createModelRouter)
}
