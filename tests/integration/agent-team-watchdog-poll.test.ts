import { expect, test } from "vitest"
import {
  runWatchdogScenario,
  WATCHDOG_COORD_TOOL,
  WATCHDOG_DEFAULT_OPTIONS,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_POLL_TOOL,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_SDK_COORD,
  WATCHDOG_TITLE_SDK_POLL,
  type WatchdogScenario,
  waitForWatchdogCondition,
} from "../fixtures"

async function observationalToolDoesNotRenew(tool: string, scenario: WatchdogScenario): Promise<void> {
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
  const timers = scenario.clock.timers.length
  scenario.sessions.model.requestTool(tool)
  scenario.sessions.model.dispatchTool()
  await waitForWatchdogCondition(scenario.observation.hasToolResult.bind(scenario.observation))
  expect(scenario.clock.timers).toHaveLength(timers)
  scenario.clock.advance(1)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
}

test(
  WATCHDOG_TITLE_SDK_POLL,
  runWatchdogScenario.bind(
    undefined,
    WATCHDOG_DEFAULT_OPTIONS,
    observationalToolDoesNotRenew.bind(undefined, WATCHDOG_POLL_TOOL),
  ),
)
test(
  WATCHDOG_TITLE_SDK_COORD,
  runWatchdogScenario.bind(
    undefined,
    WATCHDOG_DEFAULT_OPTIONS,
    observationalToolDoesNotRenew.bind(undefined, WATCHDOG_COORD_TOOL),
  ),
)
