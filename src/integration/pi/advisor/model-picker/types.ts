import { type Cancelled } from "#synapse/modules"

export interface ModelSelected {
  kind: "selected"
  model: string
}

export interface AdvisorDisabled {
  kind: "disabled"
}

export type ModelSelection = ModelSelected | AdvisorDisabled | Cancelled
