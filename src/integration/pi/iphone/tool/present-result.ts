import { IPHONE_RESULT_INFO, IPHONE_RESULT_TREE } from "#synapse/modules"
import { PI_IPHONE_SCREEN_DIMENSION_SEPARATOR, PI_IPHONE_SCREEN_LABEL, PI_IPHONE_SCREEN_UNIT } from "./constants"
import { type PiIphoneTextResult } from "./types"

export function iphoneResultText(result: PiIphoneTextResult): string {
  if (result.kind === IPHONE_RESULT_INFO) {
    return JSON.stringify(result)
  }
  if (result.kind === IPHONE_RESULT_TREE) {
    return `${result.text}${PI_IPHONE_SCREEN_LABEL}${result.viewport.width}${PI_IPHONE_SCREEN_DIMENSION_SEPARATOR}${result.viewport.height}${PI_IPHONE_SCREEN_UNIT}`
  }
  return result.text
}
