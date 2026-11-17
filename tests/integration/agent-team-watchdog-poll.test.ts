import { expect, test } from "vitest"
import {
  WATCHDOG_COORD_TOOL,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_POLL_TOOL,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_SDK_COORD,
  WATCHDOG_TITLE_SDK_POLL,
  WatchdogFixture,
  waitForWatchdogCondition,
} from "../fixtures"

async function observationalToolDoesNotRenew(tool: string): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start({ shell: false, failStop: false })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    const timers = scenario.clock.timers.length
    scenario.sessions.model.requestTool(tool)
    scenario.sessions.model.dispatchTool()
    await waitForWatchdogCondition(scenario.observation.hasToolResult.bind(scenario.observation))
    expect(scenario.clock.timers).toHaveLength(timers)
    scenario.clock.advance(1)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  } finally {
    await fixture.close()
  }
}

test(WATCHDOG_TITLE_SDK_POLL, observationalToolDoesNotRenew.bind(undefined, WATCHDOG_POLL_TOOL))
test(WATCHDOG_TITLE_SDK_COORD, observationalToolDoesNotRenew.bind(undefined, WATCHDOG_COORD_TOOL))
