import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  WATCHDOG_ENCODING,
  WATCHDOG_NO_PROCESS,
  WATCHDOG_PID_FILE,
  WATCHDOG_PROCESS_EXIT_FAILURE,
  WATCHDOG_PROCESS_START_FAILURE,
} from "./constants"
import { waitForWatchdogCondition } from "./wait"

export class WatchdogChildProof {
  private readonly file: string
  private pid = 0

  constructor(directory: string) {
    this.file = join(directory, WATCHDOG_PID_FILE)
  }

  async waitForStart(): Promise<void> {
    await waitForWatchdogCondition(this.isRunning.bind(this), WATCHDOG_PROCESS_START_FAILURE)
  }

  private isRunning(): boolean {
    if (existsSync(this.file)) {
      const pid = Number(readFileSync(this.file, WATCHDOG_ENCODING))
      if (Number.isInteger(pid) && pid > 0) {
        process.kill(pid, 0)
        this.pid = pid
        return true
      }
    }
    return false
  }

  async waitForExit(): Promise<void> {
    if (this.pid > 0) {
      await waitForWatchdogCondition(this.isAbsent.bind(this), WATCHDOG_PROCESS_EXIT_FAILURE)
    } else {
      throw new Error(WATCHDOG_PROCESS_START_FAILURE)
    }
  }

  private isAbsent(): boolean {
    try {
      process.kill(this.pid, 0)
      return false
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === WATCHDOG_NO_PROCESS) {
        return true
      }
      throw error
    }
  }
}
