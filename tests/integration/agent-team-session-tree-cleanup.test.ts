import { describe, expect, test } from "vitest"
import {
  runTreeCleanupScenario,
  TREE_CLOSE_MULTIPLE_SCENARIO,
  TREE_CLOSE_PAIR_SCENARIO,
  TREE_CLOSE_PRIMARY_SCENARIO,
  TREE_SUITE,
  TREE_TIMEOUT_MS,
  type TreeCleanupErrors,
} from "../fixtures"

async function preservesSingleCleanupFailure(fault: TreeCleanupErrors, closing: Promise<void>): Promise<void> {
  await expect(closing).rejects.toBe(fault.suspendError)
}

async function preservesAllCleanupFailures(fault: TreeCleanupErrors, closing: Promise<void>): Promise<void> {
  try {
    await closing
    expect.fail()
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError)
    if (error instanceof AggregateError) {
      expect(error.errors).toHaveLength(3)
      expect(error.errors[0]).toBe(fault.suspendError)
      expect(error.errors[1]).toBe(fault.disposeError)
      expect(error.errors[2]).toBe(fault.removeError)
    }
  }
}

async function preservesPairCleanupFailures(fault: TreeCleanupErrors, closing: Promise<void>): Promise<void> {
  try {
    await closing
    expect.fail()
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError)
    if (error instanceof AggregateError) {
      expect(error.errors).toHaveLength(2)
      expect(error.errors[0]).toBe(fault.suspendError)
      expect(error.errors[1]).toBe(fault.disposeError)
    }
  }
}

function register(): void {
  test(
    TREE_CLOSE_PAIR_SCENARIO,
    runTreeCleanupScenario.bind(null, { disposeFails: true, removeFails: false, verify: preservesPairCleanupFailures }),
    TREE_TIMEOUT_MS,
  )
  test(
    TREE_CLOSE_PRIMARY_SCENARIO,
    runTreeCleanupScenario.bind(null, {
      disposeFails: false,
      removeFails: false,
      verify: preservesSingleCleanupFailure,
    }),
    TREE_TIMEOUT_MS,
  )
  test(
    TREE_CLOSE_MULTIPLE_SCENARIO,
    runTreeCleanupScenario.bind(null, { disposeFails: true, removeFails: true, verify: preservesAllCleanupFailures }),
    TREE_TIMEOUT_MS,
  )
}

describe(TREE_SUITE, register)
