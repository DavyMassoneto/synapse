import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { expect } from "vitest"
import { TreeCleanupFault } from "./cleanup-fault"
import { SessionTreeFixture } from "./fixture"
import { type TreeCleanupThrow } from "./types"

export async function runArbitraryTreeCleanup(failure: TreeCleanupThrow, disposalFails: boolean): Promise<void> {
  const home = homedir()
  const fixture = new SessionTreeFixture()
  const session = await fixture.start()
  const fault = new TreeCleanupFault(fixture.board(), session, fixture.directory, disposalFails, disposalFails, failure)
  try {
    try {
      await fixture.close()
      expect.fail()
    } catch (error) {
      if (disposalFails) {
        expect(error).toBeInstanceOf(AggregateError)
        if (error instanceof AggregateError) {
          expect(error.errors[0]).toHaveProperty("cause", failure)
          expect(error.errors[1]).toBe(fault.disposeError)
          expect(error.errors[2]).toBe(fault.removeError)
        }
      } else if (typeof failure === "string") {
        expect(error).toBe(failure)
      } else {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.cause).toBe(failure)
        }
      }
    }
    expect(fault.disposeAttempted).toBe(true)
    expect(existsSync(fixture.directory)).toBe(false)
    expect(homedir()).toBe(home)
  } finally {
    fault.close()
  }
}
