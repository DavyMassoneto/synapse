import { type AgentToolResult, type Theme, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"
import { type AdvisorToolInput } from "../host-contracts"

export type AdvisorRenderTheme = Pick<Theme, "fg" | "bold">

export interface AdvisorRenderContext {
  lastComponent?: Component
  isError?: boolean
}

export interface AdvisorToolDetails {
  model?: string
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
