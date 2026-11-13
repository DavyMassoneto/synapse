import { readIphoneHomeState } from "#synapse/modules/iphone/internal/home-screen-layout"
import { type IphoneHomeScreenPort } from "#synapse/modules/iphone/public/contracts"
import { type IphoneHomeReadResult } from "./types"

export async function readIphoneHomeScreen(
  port: IphoneHomeScreenPort,
  signal: AbortSignal,
): Promise<IphoneHomeReadResult> {
  const viewport = await port.viewport(signal)
  signal.throwIfAborted()
  const elements = await port.elements(signal)
  signal.throwIfAborted()
  return readIphoneHomeState({ viewport: { x: viewport.width, y: viewport.height }, elements })
}
