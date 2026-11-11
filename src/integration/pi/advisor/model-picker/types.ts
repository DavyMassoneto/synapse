import { type ExtensionContext, type ExtensionUIContext, type ModelRegistry } from "@earendil-works/pi-coding-agent"
import { type Cancelled } from "#synapse/modules"

export interface ModelSelected {
  kind: "selected"
  model: string
}

export interface AdvisorDisabled {
  kind: "disabled"
}

export type ModelSelection = ModelSelected | AdvisorDisabled | Cancelled

export type PickerUI = Pick<ExtensionUIContext, "notify" | "select">

export type ModelListing = Pick<ModelRegistry, "getAvailable">

export type PickerContextBase = Pick<ExtensionContext, "hasUI" | "scopedModels">

export interface PickerContext extends PickerContextBase {
  ui: PickerUI
  modelRegistry: ModelListing
}

export type ListedModel = Pick<ReturnType<ModelListing["getAvailable"]>[number], "provider" | "id">

export type MenuChoice = Awaited<ReturnType<PickerUI["select"]>>
