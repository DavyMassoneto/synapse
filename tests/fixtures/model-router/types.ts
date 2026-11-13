import { type ModelRouteRequest } from "@earendil-works/pi-coding-agent"
import { type PiRouterContext, type PiRouterState } from "#synapse/integration"
import { type RouterFixtureHost } from "./host"
import { type RouterFixtureRegistry } from "./registry"

export type RouterFixtureContext = PiRouterContext & RouterFixtureRegistryContext

export interface RouterFixtureRegistryContext {
  modelRegistry: RouterFixtureRegistry
}

export interface RouterIntegrationSut {
  host: RouterFixtureHost
  context: RouterFixtureContext
  request: ModelRouteRequest<PiRouterState>
}
