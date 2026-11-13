import { type ModelRouterFactory } from "#synapse/modules"
import {
  PI_ROUTER_HIGH_EFFORT,
  PI_ROUTER_IMAGE_INPUT,
  PI_ROUTER_TEXT_INPUT,
  PI_ROUTER_VIRTUAL_ID,
  PI_ROUTER_VIRTUAL_NAME,
  PI_ROUTER_VIRTUAL_PROVIDER,
  PI_ROUTER_XHIGH_EFFORT,
} from "./constants"
import { PiModelRouterRoute } from "./route"
import { type ModelRouterHost } from "./types"

export function registerModelRouter(pi: ModelRouterHost, router: ModelRouterFactory): void {
  const handler = new PiModelRouterRoute(router)
  pi.registerVirtualModel({
    provider: PI_ROUTER_VIRTUAL_PROVIDER,
    id: PI_ROUTER_VIRTUAL_ID,
    name: PI_ROUTER_VIRTUAL_NAME,
    thinkingLevels: [PI_ROUTER_HIGH_EFFORT, PI_ROUTER_XHIGH_EFFORT],
    input: [PI_ROUTER_TEXT_INPUT, PI_ROUTER_IMAGE_INPUT],
    route: handler.route.bind(handler),
  })
}
