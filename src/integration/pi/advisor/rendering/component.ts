import { Text } from "@earendil-works/pi-tui"
import { type AdvisorRenderContext } from "../contracts"
import { TEXT_PADDING } from "../presentation"

export function textComponent(context: AdvisorRenderContext): Text {
  if (context.lastComponent instanceof Text) {
    return context.lastComponent
  }
  return new Text("", TEXT_PADDING, TEXT_PADDING)
}
