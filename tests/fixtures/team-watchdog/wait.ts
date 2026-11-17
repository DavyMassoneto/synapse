import { setTimeout as delay } from "node:timers/promises"
import { WATCHDOG_CONDITION_FAILURE, WATCHDOG_POLL_ATTEMPTS, WATCHDOG_TIMER_RESOLUTION_MS } from "./constants"
import { type WatchdogCondition } from "./types"

export async function waitForWatchdogCondition(condition: WatchdogCondition, failure?: string): Promise<void> {
  let observed = condition()
  for (let attempt = 0; attempt < WATCHDOG_POLL_ATTEMPTS && !observed; attempt++) {
    await delay(WATCHDOG_TIMER_RESOLUTION_MS)
    observed = condition()
  }
  if (!observed) {
    if (failure) {
      throw new Error(failure)
    }
    throw new Error(WATCHDOG_CONDITION_FAILURE)
  }
}
