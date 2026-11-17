import { test } from "vitest"
import {
  ConfirmedCloseScenario,
  runWatchdogCloseScenario,
  UnconfirmedCloseScenario,
  WATCHDOG_CLEANUP_ALL_TITLE,
  WATCHDOG_CLOSE_FAILURE_TITLE,
  WATCHDOG_TEST_TIMEOUT_MS,
  type WatchdogCloseVerification,
  type WatchdogFixture,
  type WatchdogScenario,
} from "../fixtures"

function prepareUnconfirmed(scenario: WatchdogScenario): WatchdogCloseVerification {
  return new UnconfirmedCloseScenario(scenario)
}

function prepareConfirmed(scenario: WatchdogScenario, fixture: WatchdogFixture): WatchdogCloseVerification {
  return new ConfirmedCloseScenario(scenario, fixture)
}

test(
  WATCHDOG_CLOSE_FAILURE_TITLE,
  runWatchdogCloseScenario.bind(undefined, prepareUnconfirmed),
  WATCHDOG_TEST_TIMEOUT_MS,
)
test(WATCHDOG_CLEANUP_ALL_TITLE, runWatchdogCloseScenario.bind(undefined, prepareConfirmed), WATCHDOG_TEST_TIMEOUT_MS)
