import { type Api, type Model, type ModelThinkingLevel } from "@earendil-works/pi-ai"
import { type ExtensionContext, type ModelRoute, type ModelRouteRequest } from "@earendil-works/pi-coding-agent"
import { type RouteKept, type RouteReserve, type RouteSelected } from "#synapse/modules"
import { type PiRouterClassificationLookup, type PiRouterClassificationRegistry } from "./classifier"

export interface PiRouterState {
  reason: string
}

export type PiRouterRegistry = Pick<ExtensionContext["modelRegistry"], "getAvailable" | "find" | "hasConfiguredAuth"> &
  PiRouterClassificationRegistry

export type PiRouterClassifierModel = ReturnType<PiRouterClassificationLookup["findOfType"]>

export interface PiRouterContext {
  modelRegistry: PiRouterRegistry
  hasUI: boolean
  ui: Pick<ExtensionContext["ui"], "setStatus">
}

export interface PiRouterVirtualModel {
  provider: string
  id: string
  name: string
  thinkingLevels: ModelThinkingLevel[]
  input: Model<Api>["input"]
  route(request: ModelRouteRequest<PiRouterState>, context: PiRouterContext): Promise<ModelRoute<PiRouterState>>
}

export interface ModelRouterHost {
  registerVirtualModel(model: PiRouterVirtualModel): void
}

export interface PiRouterPhysicalPair {
  model: Model<Api>
  thinkingLevel?: ModelThinkingLevel
}

export type RoutePhysicalSelection = RouteSelected | RouteReserve | RouteKept
