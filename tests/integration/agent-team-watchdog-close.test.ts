import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { expect, test } from "vitest"
import {
  WATCHDOG_CLEANUP_ALL_TITLE,
  WATCHDOG_CLOSE_FAILURE_TITLE,
  WATCHDOG_DEFAULT_OPTIONS,
  WATCHDOG_FINISH_FAILURE,
  WATCHDOG_INJECTED_CLOSE_FAILURE,
  WATCHDOG_RESET_FAILURE,
  WATCHDOG_TEST_TIMEOUT_MS,
  WATCHDOG_TRACKED_SHELL_MISSING,
  type WatchdogFailure,
  WatchdogFixture,
} from "../fixtures"

async function preservesUnconfirmedDirectory(): Promise<void> {
  const fixture = new WatchdogFixture()
  let directory = ""
  let closeAttempted = false
  try {
    const scenario = await fixture.start(WATCHDOG_DEFAULT_OPTIONS)
    directory = scenario.directory
    const shell = scenario.sessions.shells[0]
    if (!shell) {
      throw new Error(WATCHDOG_TRACKED_SHELL_MISSING)
    }
    const failure = new Error(WATCHDOG_INJECTED_CLOSE_FAILURE)
    shell.injectedFailure = failure
    let result: WatchdogFailure = null
    try {
      closeAttempted = true
      await fixture.close()
    } catch (error) {
      if (error instanceof Error) {
        result = error
      } else {
        throw error
      }
    }
    expect(result).toBeInstanceOf(AggregateError)
    if (result instanceof AggregateError) {
      expect(result.errors).toContain(failure)
    }
    expect(shell.confirmed).toBe(false)
    expect(existsSync(scenario.directory)).toBe(true)
  } finally {
    if (!closeAttempted) {
      await fixture.close()
    }
    if (directory) {
      await rm(directory, { recursive: true, force: true })
    }
  }
}

async function removesConfirmedDirectoryDespiteFailures(): Promise<void> {
  const fixture = new WatchdogFixture()
  let directory = ""
  let closeAttempted = false
  try {
    const scenario = await fixture.start(WATCHDOG_DEFAULT_OPTIONS)
    directory = scenario.directory
    const finishFailure = new Error(WATCHDOG_FINISH_FAILURE)
    const resetFailure = new Error(WATCHDOG_RESET_FAILURE)
    fixture.finishFailure = finishFailure
    fixture.resetFailure = resetFailure
    let result: WatchdogFailure = null
    try {
      closeAttempted = true
      await fixture.close()
    } catch (error) {
      if (error instanceof Error) {
        result = error
      } else {
        throw error
      }
    }
    expect(result).toBeInstanceOf(AggregateError)
    if (result instanceof AggregateError) {
      expect(result.errors).toContain(finishFailure)
      expect(result.errors).toContain(resetFailure)
    }
    expect(scenario.sessions.isShellCleanupConfirmed()).toBe(true)
    expect(existsSync(directory)).toBe(false)
  } finally {
    if (!closeAttempted) {
      await fixture.close()
    }
    if (directory) {
      await rm(directory, { recursive: true, force: true })
    }
  }
}

test(WATCHDOG_CLOSE_FAILURE_TITLE, preservesUnconfirmedDirectory, WATCHDOG_TEST_TIMEOUT_MS)
test(WATCHDOG_CLEANUP_ALL_TITLE, removesConfirmedDirectoryDespiteFailures, WATCHDOG_TEST_TIMEOUT_MS)
