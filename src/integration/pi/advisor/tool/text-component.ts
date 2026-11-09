import { Text } from "@earendil-works/pi-tui"
import { type AdvisorRenderContext } from "../host"
import { TEXT_PADDING } from "./constants"

export function textComponent(context: AdvisorRenderContext): Text {
  if (context.lastComponent instanceof Text) {
    return context.lastComponent
  }
  return new Text("", TEXT_PADDING, TEXT_PADDING)
}
