import { type RouterHistoryEntry } from "#synapse/modules/model-router/public/contracts"
import { type ROUTER_HISTORY_INCLUDED, type ROUTER_HISTORY_OMITTED } from "./constants"

export interface RouterHistoryIncluded {
  kind: typeof ROUTER_HISTORY_INCLUDED
  entry: RouterHistoryEntry
  bytes: number
}

export interface RouterHistoryOmitted {
  kind: typeof ROUTER_HISTORY_OMITTED
}

export type RouterHistoryFit = RouterHistoryIncluded | RouterHistoryOmitted

export interface RouterCurrentRequest {
  currentRequest: string
  currentIndex?: number
}

export interface RouterSelectedHistory {
  history: RouterHistoryEntry[]
  omitted: number
}
