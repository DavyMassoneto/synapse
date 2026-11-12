import { IPHONE_ACTION_UNKNOWN_COMMAND, IPHONE_ACTION_UNSUPPORTED } from "./constants"

export function isUnsupportedIphoneOperation(error: Error): boolean {
  return "code" in error && (error.code === IPHONE_ACTION_UNSUPPORTED || error.code === IPHONE_ACTION_UNKNOWN_COMMAND)
}
