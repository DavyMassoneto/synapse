import { type Component } from "@earendil-works/pi-tui"
import { type AdvisorRenderContext, type AdvisorRenderTheme, type AdvisorToolInput } from "../host"
import { RENDER_TEXT, TITLE_COLOR } from "./constants"
import { textComponent } from "./text-component"

export function renderAdvisorCall(
  _input: AdvisorToolInput,
  theme: AdvisorRenderTheme,
  context: AdvisorRenderContext,
): Component {
  const text = textComponent(context)
  text.setText(theme.fg(TITLE_COLOR, theme.bold(RENDER_TEXT.title)))
  return text
}
