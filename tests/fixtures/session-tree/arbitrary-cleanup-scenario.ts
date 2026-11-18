import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { expect } from "vitest"
import { TreeCleanupFault } from "./cleanup-fault"
import { TREE_EXPLICIT_THROW } from "./constants"
import { SessionTreeFixture } from "./fixture"
import { type TreeCleanupThrow, type TreeExplicitCleanupFailure } from "./types"

function expectExplicitCleanupFailure(error: TreeExplicitCleanupFailure, failure: TreeCleanupThrow): void {
  if (failure instanceof Error || typeof failure === "string") {
    expect(error).toBe(failure)
  } else {
    expect(error).toHaveProperty("cause", failure)
  }
}

function expectAggregateCleanupFailures(
  error: AggregateError,
  failure: TreeCleanupThrow,
  fault: TreeCleanupFault,
): void {
  if (error.errors[0] instanceof Error || typeof error.errors[0] === "string") {
    expectExplicitCleanupFailure(error.errors[0], failure)
  } else {
    expect.fail()
  }
  expect(error.errors[1]).toBe(fault.disposeError)
  expect(error.errors[2]).toBe(fault.removeError)
}

export async function runArbitraryTreeCleanup(failure: TreeCleanupThrow, disposalFails: boolean): Promise<void> {
  const home = homedir()
  const fixture = new SessionTreeFixture()
  const session = await fixture.start()
  const fault = new TreeCleanupFault(fixture.board(), session, fixture.directory, disposalFails, disposalFails, {
    kind: TREE_EXPLICIT_THROW,
    value: failure,
  })
  try {
    try {
      await fixture.close()
      expect.fail()
    } catch (error) {
      if (disposalFails) {
        expect(error).toBeInstanceOf(AggregateError)
        if (error instanceof AggregateError) {
          expectAggregateCleanupFailures(error, failure, fault)
        }
      } else if (error instanceof Error || typeof error === "string") {
        expectExplicitCleanupFailure(error, failure)
      } else {
        expect.fail()
      }
    }
    expect(fault.disposeAttempted).toBe(true)
    expect(existsSync(fixture.directory)).toBe(false)
    expect(homedir()).toBe(home)
  } finally {
    fault.close()
  }
}
