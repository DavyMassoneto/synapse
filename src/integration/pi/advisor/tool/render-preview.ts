import { ADDITIONAL_COLOR, PREVIEW_LINES, RENDER_SUCCESS, SUCCESS_COLOR } from "./constants"
import { type AdvisorRenderTheme } from "./types"

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

export function renderPreview(body: string, expanded: boolean, theme: AdvisorRenderTheme, model?: string): string {
  const lines = body.split("\n")
  const shown = visibleLines(lines, expanded)
  const suffix = hiddenNotice(lines.length - shown.length, theme)
  return `${theme.fg(SUCCESS_COLOR, previewTitle(model))}\n${shown.join("\n")}${suffix}`
}
