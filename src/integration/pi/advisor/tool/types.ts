import { type ExtensionContext, type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import { type AdvisorModelRegistry } from "../model-consultation"
import { type TranscriptSource } from "../transcript"
import { type advisorParameters } from "./constants"

export type AdvisorToolInput = Static<typeof advisorParameters>

export interface AdvisorToolDetails {
  model?: string
}

export type ToolContextBase = Pick<ExtensionContext, "getSystemPrompt">

export interface ToolContext extends ToolContextBase, TranscriptSource {
  modelRegistry: AdvisorModelRegistry
}

export type PiAdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, never>

export type AdvisorToolUpdate = Parameters<PiAdvisorTool["execute"]>[3]

export type AdvisorToolResult = ReturnType<PiAdvisorTool["execute"]>

export type AdvisorToolOutput = Awaited<AdvisorToolResult>

export type AdvisorToolBase = Omit<PiAdvisorTool, "execute" | "renderCall" | "renderResult">

export type AdvisorToolSignal = Parameters<PiAdvisorTool["execute"]>[2]
