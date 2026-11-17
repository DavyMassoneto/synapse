import { expect, test } from "vitest"
import {
  runWatchdogScenario,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_SHELL_OPTIONS,
  WATCHDOG_TEST_TIMEOUT_MS,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_SHELL,
  WatchdogChildProof,
  type WatchdogScenario,
  waitForWatchdogCondition,
} from "../fixtures"

async function terminatesRealShell(scenario: WatchdogScenario): Promise<void> {
  const child = new WatchdogChildProof(scenario.directory)
  await child.waitForStart()
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  await child.waitForExit()
  await waitForWatchdogCondition(scenario.observation.isSettled.bind(scenario.observation))
  expect(scenario.sessions.sessions[0]?.isStreaming).toBe(false)
}

test(
  WATCHDOG_TITLE_SHELL,
  runWatchdogScenario.bind(undefined, WATCHDOG_SHELL_OPTIONS, terminatesRealShell),
  WATCHDOG_TEST_TIMEOUT_MS,
)
