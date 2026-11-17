import { setImmediate } from "node:timers/promises"
import { expect, test } from "vitest"
import { createMemberTurnRuntime } from "#synapse/modules/agent-team/adapters/turn-runtime"
import { WATCHDOG_STOP_ERROR_TITLE, WATCHDOG_STOP_REENTRANT_TITLE } from "./watchdog-stop-constants"
import { WatchdogStopScenario } from "./watchdog-stop-scenario"

async function preservesOperationalError(): Promise<void> {
  const scenario = new WatchdogStopScenario(createMemberTurnRuntime())
  scenario.failJournal = true
  const id = scenario.control.begin()
  scenario.control.expired(id)
  await setImmediate()
  expect(scenario.control.ensureHealthy).toThrow(scenario.journalError)
  expect(scenario.reports).toBe(1)
}

async function rejectsReentrantConfirmation(): Promise<void> {
  const scenario = new WatchdogStopScenario(createMemberTurnRuntime())
  scenario.reenter = true
  const id = scenario.control.begin()
  scenario.control.expired(id)
  await setImmediate()
  expect(scenario.control.accepts(scenario.nextId)).toBe(true)
  expect(scenario.confirmed).toBe(0)
}

test(WATCHDOG_STOP_ERROR_TITLE, preservesOperationalError)
test(WATCHDOG_STOP_REENTRANT_TITLE, rejectsReentrantConfirmation)
