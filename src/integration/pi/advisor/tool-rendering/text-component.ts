import { Text } from "@earendil-works/pi-tui"
import { TEXT_PADDING } from "./constants"
import { type AdvisorRenderContext } from "./types"

export function textComponent(context: AdvisorRenderContext): Text {
  if (context.lastComponent instanceof Text) {
    return context.lastComponent
  }
  return new Text("", TEXT_PADDING, TEXT_PADDING)
}
