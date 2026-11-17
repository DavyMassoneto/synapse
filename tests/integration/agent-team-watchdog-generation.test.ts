import { expect, test } from "vitest"
import {
  runWatchdogScenario,
  WATCHDOG_DEFAULT_OPTIONS,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_LEAD,
  WATCHDOG_MEMBER,
  WATCHDOG_PROMPT,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_RELOAD,
  WATCHDOG_TITLE_STALE,
  type WatchdogScenario,
  waitForWatchdogCondition,
} from "../fixtures"

async function oldTimerCannotAbortNewTurn(scenario: WatchdogScenario): Promise<void> {
  const oldTimer = scenario.clock.timers[0]
  expect(oldTimer).toBeDefined()
  scenario.clock.elapse(WATCHDOG_TIMEOUT_MS)
  scenario.sessions.model.finish()
  await waitForWatchdogCondition(scenario.observation.isSettled.bind(scenario.observation))
  scenario.team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, WATCHDOG_PROMPT)
  await waitForWatchdogCondition(scenario.observation.isStreaming.bind(scenario.observation))
  const count = scenario.host.notices.length
  oldTimer?.callback()
  expect(scenario.host.notices).toHaveLength(count)
  expect(scenario.sessions.sessions[0]?.isStreaming).toBe(true)
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
}

async function oldTimerCannotAbortReloadedMember(scenario: WatchdogScenario): Promise<void> {
  const oldTimer = scenario.clock.timers[0]
  expect(oldTimer).toBeDefined()
  scenario.clock.elapse(WATCHDOG_TIMEOUT_MS)
  scenario.sessions.model.finish()
  await scenario.team.suspend()
  await scenario.team.restore(scenario.sessions.records, [])
  scenario.observation.selectSession(1)
  scenario.team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, WATCHDOG_PROMPT)
  await waitForWatchdogCondition(scenario.observation.isStreaming.bind(scenario.observation))
  const count = scenario.host.notices.length
  oldTimer?.callback()
  expect(scenario.host.notices).toHaveLength(count)
  expect(scenario.sessions.sessions[1]?.isStreaming).toBe(true)
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
}

test(WATCHDOG_TITLE_STALE, runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, oldTimerCannotAbortNewTurn))
test(
  WATCHDOG_TITLE_RELOAD,
  runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, oldTimerCannotAbortReloadedMember),
)
