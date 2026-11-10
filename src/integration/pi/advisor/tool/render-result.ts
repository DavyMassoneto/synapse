import { type AgentToolResult, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"
import { extractText } from "../content-text"
import {
  ADDITIONAL_COLOR,
  ERROR_COLOR,
  PENDING_COLOR,
  PREVIEW_LINES,
  RENDER_PENDING,
  RENDER_SUCCESS,
  SUCCESS_COLOR,
} from "./constants"
import { textComponent } from "./text-component"
import { type AdvisorRenderContext, type AdvisorRenderTheme, type AdvisorToolDetails } from "./types"

function visibleLines(lines: string[], expanded: boolean): string[] {
  if (expanded) {
    return lines
  }
  return lines.slice(0, PREVIEW_LINES)
}

function hiddenNotice(hidden: number, theme: AdvisorRenderTheme): string {
  if (hidden > 0) {
    return `\n${theme.fg(ADDITIONAL_COLOR, `... (${hidden} linhas a mais)`)}`
  }
  return ""
}

function previewTitle(model?: string): string {
  if (model) {
    return `${RENDER_SUCCESS} (${model})`
  }
  return RENDER_SUCCESS
}

function renderPreview(body: string, expanded: boolean, theme: AdvisorRenderTheme, model?: string): string {
  const lines = body.split("\n")
  const shown = visibleLines(lines, expanded)
  const suffix = hiddenNotice(lines.length - shown.length, theme)
  return `${theme.fg(SUCCESS_COLOR, previewTitle(model))}\n${shown.join("\n")}${suffix}`
}

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
