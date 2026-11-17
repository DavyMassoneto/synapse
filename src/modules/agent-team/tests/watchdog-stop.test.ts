import { setImmediate } from "node:timers/promises"
import { expect, test } from "vitest"
import { createMemberTurnRuntime } from "#synapse/modules/agent-team/adapters/turn-runtime"
import {
  WATCHDOG_STOP_ALL_ERRORS_TITLE,
  WATCHDOG_STOP_ERROR_TITLE,
  WATCHDOG_STOP_REENTRANT_TITLE,
} from "./watchdog-stop-constants"
import { WatchdogStopScenario } from "./watchdog-stop-scenario"

async function preservesOperationalError(): Promise<void> {
  const scenario = new WatchdogStopScenario(createMemberTurnRuntime())
  scenario.failJournal = true
  const id = scenario.control.begin()
  scenario.control.expired(id)
  await setImmediate()
  expect(scenario.control.ensureHealthy).toThrow(AggregateError)
  expect(scenario.reports).toBe(1)
}

async function rejectsReentrantConfirmation(): Promise<void> {
  const scenario = new WatchdogStopScenario(createMemberTurnRuntime())
  scenario.reenter = true
  const id = scenario.control.begin()
  scenario.control.expired(id)
  await setImmediate()
  expect(scenario.control.isCurrentExecution(scenario.nextId)).toBe(true)
  expect(scenario.confirmed).toBe(0)
}

test(WATCHDOG_STOP_ERROR_TITLE, preservesOperationalError)
test(WATCHDOG_STOP_REENTRANT_TITLE, rejectsReentrantConfirmation)

async function retainsEveryFailure(): Promise<void> {
  const scenario = new WatchdogStopScenario(createMemberTurnRuntime())
  scenario.failJournal = true
  scenario.failReport = true
  scenario.control.expired(scenario.control.begin())
  await setImmediate()
  try {
    scenario.control.ensureHealthy()
    expect.fail()
  } catch (failure) {
    expect(failure).toBeInstanceOf(AggregateError)
    if (failure instanceof AggregateError) {
      expect(failure.errors).toEqual([scenario.journalError, scenario.reportError])
      expect(failure.errors[0]).toBe(scenario.journalError)
      expect(failure.errors[1]).toBe(scenario.reportError)
    }
  }
}

test(WATCHDOG_STOP_ALL_ERRORS_TITLE, retainsEveryFailure)
