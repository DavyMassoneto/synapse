import { setTimeout as delay } from "node:timers/promises"
import { retryDelayMs } from "./rate-limit"

export function waitForRateLimit(response: Response): Promise<void> {
  return delay(retryDelayMs(response))
}
