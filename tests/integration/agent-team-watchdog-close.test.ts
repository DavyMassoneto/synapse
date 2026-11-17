import { test } from "vitest"
import {
  ConfirmedCloseScenario,
  runWatchdogCloseScenario,
  UnconfirmedCloseScenario,
  WATCHDOG_CLEANUP_ALL_TITLE,
  WATCHDOG_CLOSE_FAILURE_TITLE,
  WATCHDOG_TEST_TIMEOUT_MS,
} from "../fixtures"

test(
  WATCHDOG_CLOSE_FAILURE_TITLE,
  runWatchdogCloseScenario.bind(undefined, UnconfirmedCloseScenario),
  WATCHDOG_TEST_TIMEOUT_MS,
)
test(
  WATCHDOG_CLEANUP_ALL_TITLE,
  runWatchdogCloseScenario.bind(undefined, ConfirmedCloseScenario),
  WATCHDOG_TEST_TIMEOUT_MS,
)
