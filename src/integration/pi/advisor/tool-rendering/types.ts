import { type AgentToolResult, type Theme, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"

export type AdvisorRenderTheme = Pick<Theme, "fg" | "bold">

export interface AdvisorRenderContext {
  lastComponent?: Component
  isError?: boolean
}

export interface AdvisorToolDetails {
  model?: string
}

export interface AdvisorRenderers<Input> {
  renderCall(input: Input, theme: AdvisorRenderTheme, context: AdvisorRenderContext): Component
  renderResult(
    result: AgentToolResult<AdvisorToolDetails>,
    options: ToolRenderResultOptions,
    theme: AdvisorRenderTheme,
    context: AdvisorRenderContext,
  ): Component
}
