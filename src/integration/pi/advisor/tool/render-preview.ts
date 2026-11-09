import { ADDITIONAL_COLOR, PREVIEW_LINES, RENDER_TEXT, SUCCESS_COLOR } from "./constants"
import { type AdvisorRenderTheme } from "./types"

export function renderPreview(body: string, expanded: boolean, theme: AdvisorRenderTheme, model?: string): string {
  const lines = body.split("\n")
  let shown = lines
  if (!expanded) {
    shown = lines.slice(0, PREVIEW_LINES)
  }
  const remaining = lines.length - shown.length
  let suffix = ""
  if (!expanded && remaining > 0) {
    suffix = `\n${theme.fg(ADDITIONAL_COLOR, `... (${remaining} linhas a mais)`)}`
  }
  let title = RENDER_TEXT.success
  if (typeof model === "string") {
    title = `${title} (${model})`
  }
  return `${theme.fg(SUCCESS_COLOR, title)}\n${shown.join("\n")}${suffix}`
}
