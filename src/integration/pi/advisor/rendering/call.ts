import { type Component } from "@earendil-works/pi-tui"
import { type AdvisorRenderContext, type AdvisorRenderTheme, type AdvisorToolInput } from "../contracts"
import { RENDER_TEXT, TITLE_COLOR } from "../presentation"
import { textComponent } from "./component"

export function renderAdvisorCall(
  _input: AdvisorToolInput,
  theme: AdvisorRenderTheme,
  context: AdvisorRenderContext,
): Component {
  const text = textComponent(context)
  text.setText(theme.fg(TITLE_COLOR, theme.bold(RENDER_TEXT.title)))
  return text
}
