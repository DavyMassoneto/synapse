import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { describe, expect, test } from "vitest"
import {
  SessionTreeFixture,
  TREE_CLOSE_MULTIPLE_SCENARIO,
  TREE_CLOSE_PAIR_SCENARIO,
  TREE_CLOSE_PRIMARY_SCENARIO,
  TREE_SUITE,
  TREE_TIMEOUT_MS,
  TreeCleanupFault,
} from "../fixtures"

async function preservesSingleCleanupFailure(): Promise<void> {
  const home = homedir()
  const fixture = new SessionTreeFixture()
  const session = await fixture.start()
  const fault = new TreeCleanupFault(fixture.board(), session, fixture.directory, false, false)
  try {
    const closing = fixture.close()
    expect(fixture.close()).toBe(closing)
    await expect(closing).rejects.toBe(fault.suspendError)
    expect(existsSync(fixture.directory)).toBe(false)
    expect(homedir()).toBe(home)
  } finally {
    fault.close()
  }
}

async function preservesAllCleanupFailures(): Promise<void> {
  const home = homedir()
  const fixture = new SessionTreeFixture()
  const session = await fixture.start()
  const fault = new TreeCleanupFault(fixture.board(), session, fixture.directory, true, true)
  try {
    try {
      await fixture.close()
      expect.fail()
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      if (error instanceof AggregateError) {
        expect(error.errors[0]).toBe(fault.suspendError)
        expect(error.errors[1]).toBe(fault.disposeError)
        expect(error.errors[2]).toBe(fault.removeError)
      }
    }
    expect(existsSync(fixture.directory)).toBe(false)
    expect(homedir()).toBe(home)
  } finally {
    fault.close()
  }
}

async function preservesPairCleanupFailures(): Promise<void> {
  const home = homedir()
  const fixture = new SessionTreeFixture()
  const session = await fixture.start()
  const fault = new TreeCleanupFault(fixture.board(), session, fixture.directory, true, false)
  try {
    try {
      await fixture.close()
      expect.fail()
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      if (error instanceof AggregateError) {
        expect(error.errors[0]).toBe(fault.suspendError)
        expect(error.errors[1]).toBe(fault.disposeError)
      }
    }
    expect(existsSync(fixture.directory)).toBe(false)
    expect(homedir()).toBe(home)
  } finally {
    fault.close()
  }
}

function register(): void {
  test(TREE_CLOSE_PAIR_SCENARIO, preservesPairCleanupFailures, TREE_TIMEOUT_MS)
  test(TREE_CLOSE_PRIMARY_SCENARIO, preservesSingleCleanupFailure, TREE_TIMEOUT_MS)
  test(TREE_CLOSE_MULTIPLE_SCENARIO, preservesAllCleanupFailures, TREE_TIMEOUT_MS)
}

describe(TREE_SUITE, register)
