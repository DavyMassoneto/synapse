import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  WATCHDOG_DIRECTORY,
  WATCHDOG_MEMBER,
  WATCHDOG_PRIVATE_DESCRIPTION,
  WATCHDOG_PROMPT,
  WATCHDOG_SHELL_CLEANUP_UNCONFIRMED,
} from "./constants"
import { createWatchdogScenario } from "./scenario"
import { type WatchdogFixtureOptions } from "./types"

export class WatchdogFixture {
  private scenario?: ReturnType<typeof createWatchdogScenario>

  private directory = ""

  async start(options: WatchdogFixtureOptions): Promise<ReturnType<typeof createWatchdogScenario>> {
    this.directory = await mkdtemp(join(tmpdir(), WATCHDOG_DIRECTORY))
    const scenario = createWatchdogScenario(this.directory)
    this.scenario = scenario
    scenario.sessions.model.shell = options.shell
    scenario.sessions.failStop = options.failStop
    await scenario.team.start({
      name: WATCHDOG_MEMBER,
      description: WATCHDOG_PRIVATE_DESCRIPTION,
      task: WATCHDOG_PROMPT,
    })
    return scenario
  }

  private resetStopFailure(): void {
    if (this.scenario) {
      this.scenario.sessions.failStop = false
      if (this.scenario.sessions.unconfirmedShell) {
        this.scenario.sessions.unconfirmedShell.fail = false
      }
    }
  }

  async close(): Promise<void> {
    let ownershipConfirmed = !this.scenario
    if (this.scenario) {
      try {
        this.scenario.sessions.model.finish()
      } finally {
        try {
          this.resetStopFailure()
        } finally {
          await this.scenario.team.suspend()
          ownershipConfirmed = this.scenario.sessions.isShellCleanupConfirmed()
        }
      }
    }
    if (ownershipConfirmed) {
      if (this.directory) {
        await rm(this.directory, { recursive: true, force: true })
      }
    } else {
      throw new Error(WATCHDOG_SHELL_CLEANUP_UNCONFIRMED)
    }
  }
}
