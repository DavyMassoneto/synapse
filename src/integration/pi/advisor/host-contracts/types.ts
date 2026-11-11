import { type ExtensionContext, type ExtensionUIContext, type ModelRegistry } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import { type advisorParameters } from "./constants"

export type AdvisorToolInput = Static<typeof advisorParameters>

export type AdvisorUI = Pick<ExtensionUIContext, "notify" | "select" | "setStatus">

export type AdvisorRegistry = Pick<ModelRegistry, "getAvailable" | "find" | "hasConfiguredAuth" | "streamSimple">

export type AdvisorModelRegistry = Pick<AdvisorRegistry, "find" | "hasConfiguredAuth" | "streamSimple">

export type AdvisorSession = Pick<ExtensionContext["sessionManager"], "buildSessionProjection">

export type AdvisorContextBase = Pick<ExtensionContext, "hasUI" | "scopedModels" | "getSystemPrompt">

export interface AdvisorContext extends AdvisorContextBase {
  ui: AdvisorUI
  modelRegistry: AdvisorRegistry
  sessionManager: AdvisorSession
}
