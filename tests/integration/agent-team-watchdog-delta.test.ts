import { expect, test } from "vitest"
import {
  runWatchdogScenario,
  WATCHDOG_DEFAULT_OPTIONS,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_THINKING_DELTA,
  WATCHDOG_TITLE_TOOL_DELTA,
  type WatchdogScenario,
  waitForWatchdogCondition,
} from "../fixtures"

async function staleTextDoesNotRenew(scenario: WatchdogScenario): Promise<void> {
  const session = scenario.observation.selectedSession()
  const unsubscribe = session.subscribe(scenario.observation.observe.bind(scenario.observation))
  try {
    scenario.sessions.model.update()
    await waitForWatchdogCondition(scenario.observation.hasTextUpdate.bind(scenario.observation))
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    scenario.sessions.model.toolDelta()
    await waitForWatchdogCondition(scenario.observation.hasToolUpdate.bind(scenario.observation))
    scenario.clock.advance(1)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  } finally {
    unsubscribe()
  }
}

async function thinkingDeltaRenews(scenario: WatchdogScenario): Promise<void> {
  const session = scenario.observation.selectedSession()
  const unsubscribe = session.subscribe(scenario.observation.observe.bind(scenario.observation))
  try {
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    scenario.sessions.model.thinkingDelta()
    await waitForWatchdogCondition(scenario.observation.hasThinkingUpdate.bind(scenario.observation))
    scenario.clock.advance(1)
    expect(scenario.host.notices).toHaveLength(0)
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  } finally {
    unsubscribe()
  }
}

test(WATCHDOG_TITLE_TOOL_DELTA, runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, staleTextDoesNotRenew))
test(WATCHDOG_TITLE_THINKING_DELTA, runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, thinkingDeltaRenews))
