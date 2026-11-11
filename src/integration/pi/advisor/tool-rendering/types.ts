import { type AgentToolResult, type Theme, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"
import { type AdvisorToolDetails, type AdvisorToolInput } from "../tool"

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
