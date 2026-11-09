import { type Cancelled } from "#synapse/modules"
import { type AdvisorUI } from "../host"

export interface ModelSelected {
  kind: "selected"
  model: string
}

export interface AdvisorDisabled {
  kind: "disabled"
}

export type ModelSelection = ModelSelected | AdvisorDisabled | Cancelled

export type MenuChoice = Awaited<ReturnType<AdvisorUI["select"]>>
