import { WatchdogFixture, type WatchdogFixtureOptions, waitForWatchdogCondition } from "../team-watchdog"
import { type WatchdogScenarioBody } from "./types"

export async function runWatchdogScenario(options: WatchdogFixtureOptions, body: WatchdogScenarioBody): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start(options)
    if (!options.shell) {
      await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    }
    await body(scenario)
  } finally {
    await fixture.close()
  }
}
