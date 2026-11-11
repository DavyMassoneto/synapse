import { type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type AdvisorContext, type AdvisorToolInput, type advisorParameters } from "../host-contracts"
import { type AdvisorRenderers, type AdvisorToolDetails } from "../tool-rendering"

export type PiAdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, never>

export type AdvisorToolUpdate = Parameters<PiAdvisorTool["execute"]>[3]

export type AdvisorToolResult = ReturnType<PiAdvisorTool["execute"]>

export type AdvisorToolOutput = Awaited<AdvisorToolResult>

export type AdvisorToolBase = Omit<PiAdvisorTool, "execute" | "renderCall" | "renderResult">

export type AdvisorToolSignal = Parameters<PiAdvisorTool["execute"]>[2]

export interface AdvisorTool extends AdvisorToolBase, AdvisorRenderers {
  execute(
    id: string,
    input: AdvisorToolInput,
    signal: AdvisorToolSignal,
    update: AdvisorToolUpdate,
    context: AdvisorContext,
  ): AdvisorToolResult
}

export interface ToolRegistry {
  registerTool(tool: AdvisorTool): void
}
