import { type Api, type Model } from "@earendil-works/pi-ai"
import { type Failure } from "#synapse/modules/advisor/public"

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
