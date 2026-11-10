import { setTimeout as delay } from "node:timers/promises"
import { retryDelayMs } from "./rate-limit"

export async function waitForRateLimit(response: Response): Promise<void> {
  console.log(`GitHub limitou a taxa (${response.status}); nova tentativa`)
  await delay(retryDelayMs(response))
}
