import { Value } from "typebox/value"
import { PI_IPHONE_INVALID_ARGUMENTS, PI_IPHONE_SIGNAL_REQUIRED } from "./constants"
import { PI_IPHONE_PARAMETERS } from "./parameters"
import { type PiIphoneInput, type PiIphoneSignal } from "./types"

export function preflightIphoneTool(input: PiIphoneInput, signal: PiIphoneSignal): AbortSignal {
  if (!signal) {
    throw new Error(PI_IPHONE_SIGNAL_REQUIRED)
  }
  signal.throwIfAborted()
  if (!Value.Check(PI_IPHONE_PARAMETERS, input)) {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  return signal
}
