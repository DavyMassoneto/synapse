import { type ModelRouterHost, registerModelRouter } from "#synapse/integration/pi/model-router"
import { createModelRouter } from "#synapse/modules/model-router"

export function composeModelRouter(pi: ModelRouterHost): void {
  registerModelRouter(pi, createModelRouter)
}
