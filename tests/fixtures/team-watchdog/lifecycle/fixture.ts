import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { WATCHDOG_DIRECTORY, WATCHDOG_MEMBER, WATCHDOG_PRIVATE_DESCRIPTION, WATCHDOG_PROMPT } from "../constants"
import { createWatchdogScenario } from "../scenario"
import { type WatchdogFixtureOptions, type WatchdogScenario } from "./types"

export class WatchdogFixture {
  private scenario?: WatchdogScenario
  private directory = ""

  async start(options: WatchdogFixtureOptions): Promise<WatchdogScenario> {
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

  async close(): Promise<void> {
    try {
      if (this.scenario) {
        try {
          this.scenario.sessions.model.finish()
        } finally {
          try {
            this.scenario.sessions.failStop = false
            if (this.scenario.sessions.unconfirmedShell) {
              this.scenario.sessions.unconfirmedShell.fail = false
            }
          } finally {
            await this.scenario.team.suspend()
          }
        }
      }
    } finally {
      if (this.directory) {
        await rm(this.directory, { recursive: true, force: true })
      }
    }
  }
}
