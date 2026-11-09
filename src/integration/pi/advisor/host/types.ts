import { type AssistantMessage, type ImageContent } from "@earendil-works/pi-ai"
import { type ExtensionContext, type ExtensionUIContext, type ModelRegistry } from "@earendil-works/pi-coding-agent"

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

export type OptionalModel = string | undefined

export type TextBlocks = Array<ImageContent | AssistantMessage["content"][number]>
