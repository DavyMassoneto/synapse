import type {
  AgentToolResult,
  Theme,
  ToolRenderResultOptions,
} from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import type { AdvisorToolDetails, AdvisorToolInput } from "./tool-base-types";

export type AdvisorRenderTheme = Pick<Theme, "fg" | "bold">;

export interface AdvisorRenderContext {
  lastComponent?: Component;
  isError?: boolean;
}

export interface AdvisorRenderers {
  renderCall(
    input: AdvisorToolInput,
    theme: AdvisorRenderTheme,
    context: AdvisorRenderContext,
  ): Component;
  renderResult(
    result: AgentToolResult<AdvisorToolDetails>,
    options: ToolRenderResultOptions,
    theme: AdvisorRenderTheme,
    context: AdvisorRenderContext,
  ): Component;
}
