import { type AgentToolResult, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"
import { extractText } from "../content-text"
import { type AdvisorToolDetails } from "../tool"
import {
  ADDITIONAL_COLOR,
  ERROR_COLOR,
  HIDDEN_LINES_PREFIX,
  HIDDEN_LINES_SUFFIX,
  LINE_BREAK,
  MODEL_PREFIX,
  MODEL_SUFFIX,
  PENDING_COLOR,
  PREVIEW_LINES,
  RENDER_PENDING,
  RENDER_SUCCESS,
  SUCCESS_COLOR,
} from "./constants"
import { textComponent } from "./text-component"
import { type AdvisorRenderContext, type AdvisorRenderTheme } from "./types"

function visibleLines(lines: string[], expanded: boolean): string[] {
  if (expanded) {
    return lines
  }
  return lines.slice(0, PREVIEW_LINES)
}

function hiddenNotice(hidden: number, theme: AdvisorRenderTheme): string {
  if (hidden > 0) {
    return `${LINE_BREAK}${theme.fg(ADDITIONAL_COLOR, `${HIDDEN_LINES_PREFIX}${hidden}${HIDDEN_LINES_SUFFIX}`)}`
  }
  return ""
}

function previewTitle(model?: string): string {
  if (model) {
    return `${RENDER_SUCCESS}${MODEL_PREFIX}${model}${MODEL_SUFFIX}`
  }
  return RENDER_SUCCESS
}

function renderPreview(body: string, expanded: boolean, theme: AdvisorRenderTheme, model?: string): string {
  const lines = body.split(LINE_BREAK)
  const shown = visibleLines(lines, expanded)
  const suffix = hiddenNotice(lines.length - shown.length, theme)
  return `${theme.fg(SUCCESS_COLOR, previewTitle(model))}${LINE_BREAK}${shown.join(LINE_BREAK)}${suffix}`
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
