import { rm } from "node:fs/promises"
import { captureShellCleanup } from "#synapse/integration/pi/agent-team"
import { WATCHDOG_DEFAULT_OPTIONS, WatchdogFixture } from "../team-watchdog"
import { type WatchdogCloseScenarioConstructor } from "./types"

export async function runWatchdogCloseScenario(Scenario: WatchdogCloseScenarioConstructor): Promise<void> {
  const fixture = new WatchdogFixture()
  let directory = ""
  let closeAttempted = false
  try {
    const scenario = await fixture.start(WATCHDOG_DEFAULT_OPTIONS)
    directory = scenario.directory
    const prepared = new Scenario(scenario, fixture)
    closeAttempted = true
    const result = await captureShellCleanup(fixture.close.bind(fixture))
    prepared.verify(result)
  } finally {
    try {
      if (!closeAttempted) {
        await fixture.close()
      }
    } finally {
      if (directory && fixture.isRealShellCloseConfirmed()) {
        await rm(directory, { recursive: true, force: true })
      }
    }
  }
}
