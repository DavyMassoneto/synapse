import { type Component } from "@earendil-works/pi-tui"
import { RENDER_TITLE, TITLE_COLOR } from "./constants"
import { textComponent } from "./text-component"
import { type AdvisorRenderContext, type AdvisorRenderTheme } from "./types"

export function renderAdvisorCall<Input>(
  _input: Input,
  theme: AdvisorRenderTheme,
  context: AdvisorRenderContext,
): Component {
  const text = textComponent(context)
  text.setText(theme.fg(TITLE_COLOR, theme.bold(RENDER_TITLE)))
  return text
}
