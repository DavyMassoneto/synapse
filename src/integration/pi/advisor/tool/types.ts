import {
  type AgentToolResult,
  type Theme,
  type ToolDefinition,
  type ToolRenderResultOptions,
} from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"
import { type AdvisorContext } from "../host"
import { type advisorParameters } from "./constants"

export type AdvisorRenderTheme = Pick<Theme, "fg" | "bold">

export interface AdvisorRenderContext {
  lastComponent?: Component
  isError?: boolean
}

export interface AdvisorRenderers {
  renderCall(input: AdvisorToolInput, theme: AdvisorRenderTheme, context: AdvisorRenderContext): Component
  renderResult(
    result: AgentToolResult<AdvisorToolDetails>,
    options: ToolRenderResultOptions,
    theme: AdvisorRenderTheme,
    context: AdvisorRenderContext,
  ): Component
}

export interface AdvisorToolDetails {
  model?: string
}

export type PiAdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, never>

export type AdvisorToolUpdate = Parameters<PiAdvisorTool["execute"]>[3]

export type AdvisorToolResult = ReturnType<PiAdvisorTool["execute"]>

export type AdvisorToolOutput = Awaited<AdvisorToolResult>

export type AdvisorToolInput = Parameters<PiAdvisorTool["execute"]>[1]

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
