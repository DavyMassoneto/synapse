import { type Cancelled } from "#synapse/modules"
import { type AdvisorContext, type AdvisorUI } from "../host-contracts"

export interface ModelSelected {
  kind: "selected"
  model: string
}

export interface AdvisorDisabled {
  kind: "disabled"
}

export type ModelSelection = ModelSelected | AdvisorDisabled | Cancelled

export type ListedModel = Pick<ReturnType<AdvisorContext["modelRegistry"]["getAvailable"]>[number], "provider" | "id">

export type MenuChoice = Awaited<ReturnType<AdvisorUI["select"]>>
