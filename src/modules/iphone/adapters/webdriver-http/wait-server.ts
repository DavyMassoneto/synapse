import { setTimeout } from "node:timers/promises"
import { IPHONE_HTTP_START_ATTEMPTS, IPHONE_HTTP_START_FAILURE, IPHONE_HTTP_START_INTERVAL_MS } from "./constants"
import { type IphoneHttpDiagnosis } from "./diagnosis"

export async function waitIphoneServer(diagnosis: IphoneHttpDiagnosis, signal: AbortSignal): Promise<void> {
  let running = false
  for (let attempt = 0; attempt < IPHONE_HTTP_START_ATTEMPTS && !running; attempt++) {
    running = await diagnosis.serverResponds(signal)
    if (!running) {
      await setTimeout(IPHONE_HTTP_START_INTERVAL_MS, null, { signal })
    }
  }
  if (!running) {
    throw new Error(IPHONE_HTTP_START_FAILURE)
  }
}
