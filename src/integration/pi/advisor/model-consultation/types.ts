import { type Api, type Model } from "@earendil-works/pi-ai"
import { type ModelRegistry } from "@earendil-works/pi-coding-agent"
import { type Failure } from "#synapse/modules"

export type AdvisorModelRegistry = Pick<ModelRegistry, "find" | "hasConfiguredAuth" | "streamSimple">

export interface PiThinkingBudgets {
  off: number
  minimal: number
  low: number
  medium: number
  high: number
  xhigh: number
  max: number
}

export interface ModelFound {
  kind: "found"
  model: Model<Api>
}

export type ModelLookup = ModelFound | Failure
