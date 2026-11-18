import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { expect } from "vitest"
import { TreeCleanupFault } from "./cleanup-fault"
import { TREE_DEFAULT_CLEANUP_THROW } from "./constants"
import { SessionTreeFixture } from "./fixture"
import { type TreeCleanupScenario } from "./types"

export async function runTreeCleanupScenario(scenario: TreeCleanupScenario): Promise<void> {
  const home = homedir()
  const fixture = new SessionTreeFixture()
  const session = await fixture.start()
  const fault = new TreeCleanupFault(
    fixture.board(),
    session,
    fixture.directory,
    scenario.disposeFails,
    scenario.removeFails,
    TREE_DEFAULT_CLEANUP_THROW,
  )
  try {
    const closing = fixture.close()
    expect(fixture.close()).toBe(closing)
    await scenario.verify(fault, closing)
    expect(existsSync(fixture.directory)).toBe(false)
    expect(homedir()).toBe(home)
  } finally {
    fault.close()
  }
}
