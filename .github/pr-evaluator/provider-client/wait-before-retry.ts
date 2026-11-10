import { setTimeout as delay } from "node:timers/promises"
import { RETRY_DELAY_MS } from "./constants"

export function waitBeforeRetry(): Promise<void> {
  return delay(RETRY_DELAY_MS)
}
