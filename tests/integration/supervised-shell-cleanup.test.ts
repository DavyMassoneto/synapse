import { expect, test } from "vitest"
import { captureShellCleanup } from "#synapse/integration/pi/agent-team/shell-cleanup"
import {
  CleanupActionScenario,
  SUPERVISED_TEST_ASYNC_CLEANUP_TITLE,
  SUPERVISED_TEST_SYNC_CLEANUP_TITLE,
  SUPERVISED_TEST_VALUE_CLEANUP_TITLE,
} from "../fixtures"

async function syncFailure(): Promise<void> {
  const scenario = new CleanupActionScenario()
  const failed = captureShellCleanup(scenario.throwsSynchronously.bind(scenario))
  const completed = captureShellCleanup(scenario.complete.bind(scenario))
  const results = await Promise.all([failed, completed])
  expect(scenario.finished).toBe(true)
  expect(results[0]).toEqual({ failed: true, error: scenario.error })
  expect(results[1]).toEqual({ failed: false, value: 7 })
}
async function asyncFailure(): Promise<void> {
  const scenario = new CleanupActionScenario()
  const result = await captureShellCleanup(scenario.rejectAsynchronously.bind(scenario))
  expect(result).toEqual({ failed: true, error: scenario.error })
}
async function exactValue(): Promise<void> {
  const scenario = new CleanupActionScenario()
  const result = await captureShellCleanup(scenario.complete.bind(scenario))
  expect(result).toEqual({ failed: false, value: 7 })
}

test(SUPERVISED_TEST_SYNC_CLEANUP_TITLE, syncFailure)
test(SUPERVISED_TEST_ASYNC_CLEANUP_TITLE, asyncFailure)
test(SUPERVISED_TEST_VALUE_CLEANUP_TITLE, exactValue)
