import { type RouterHistoryEntry } from "#synapse/modules/model-router/public/contracts"

export interface RouterHistoryIncluded {
  kind: "included"
  entry: RouterHistoryEntry
  bytes: number
}

export interface RouterHistoryOmitted {
  kind: "omitted"
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
