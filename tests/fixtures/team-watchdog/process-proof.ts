import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { setTimeout as delay } from "node:timers/promises"
import {
  WATCHDOG_ENCODING,
  WATCHDOG_NO_PROCESS,
  WATCHDOG_PID_FILE,
  WATCHDOG_POLL_ATTEMPTS,
  WATCHDOG_PROCESS_ALIVE_FAILURE,
  WATCHDOG_TIMER_RESOLUTION_MS,
} from "./constants"

export async function waitForWatchdogChild(directory: string): Promise<number> {
  const file = join(directory, WATCHDOG_PID_FILE)
  for (let attempt = 0; attempt < WATCHDOG_POLL_ATTEMPTS; attempt++) {
    if (existsSync(file)) {
      const pid = Number(readFileSync(file, WATCHDOG_ENCODING))
      if (Number.isInteger(pid) && pid > 0) {
        process.kill(pid, 0)
        return pid
      }
    }
    await delay(WATCHDOG_TIMER_RESOLUTION_MS)
  }
  throw new Error(WATCHDOG_PROCESS_ALIVE_FAILURE)
}

export async function waitForWatchdogChildExit(pid: number): Promise<void> {
  let absent = false
  for (let attempt = 0; attempt < WATCHDOG_POLL_ATTEMPTS && !absent; attempt++) {
    try {
      process.kill(pid, 0)
      await delay(WATCHDOG_TIMER_RESOLUTION_MS)
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === WATCHDOG_NO_PROCESS) {
        absent = true
      } else {
        throw error
      }
    }
  }
  if (!absent) {
    throw new Error(WATCHDOG_PROCESS_ALIVE_FAILURE)
  }
}
