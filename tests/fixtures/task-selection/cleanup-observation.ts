import { existsSync } from "node:fs"
import { setTimeout } from "node:timers/promises"
import { expect } from "vitest"
import { SELECTION_CLEANUP_OBSERVATION_MS, SELECTION_CLEANUP_POLL_MS } from "./constants"

export async function observeSelectionCleanup(directory: string): Promise<void> {
  expect(existsSync(directory)).toBe(false)
  const deadline = Date.now() + SELECTION_CLEANUP_OBSERVATION_MS
  while (Date.now() < deadline) {
    await setTimeout(SELECTION_CLEANUP_POLL_MS)
    expect(existsSync(directory)).toBe(false)
  }
}
