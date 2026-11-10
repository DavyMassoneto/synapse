import { type AgentToolResult, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"
import { extractText } from "../host"
import { ERROR_COLOR, PENDING_COLOR, RENDER_PENDING } from "./constants"
import { renderPreview } from "./render-preview"
import { textComponent } from "./text-component"
import { type AdvisorRenderContext, type AdvisorRenderTheme, type AdvisorToolDetails } from "./types"

export function renderAdvisorResult(
  result: AgentToolResult<AdvisorToolDetails>,
  options: ToolRenderResultOptions,
  theme: AdvisorRenderTheme,
  context: AdvisorRenderContext,
): Component {
  const text = textComponent(context)
  if (options.isPartial) {
    text.setText(theme.fg(PENDING_COLOR, RENDER_PENDING))
    return text
  }
  const body = extractText(result.content)
  if (context.isError) {
    text.setText(theme.fg(ERROR_COLOR, body))
    return text
  }
  text.setText(renderPreview(body, options.expanded, theme, result.details?.model))
  return text
}
