import { describe, expect, test } from "vitest"
import {
  isSelectionToolError,
  observeSelectionCleanup,
  SELECTION_CLEANUP_REFUSAL,
  SELECTION_CLEANUP_START,
  SELECTION_SUITE,
  SELECTION_TIMEOUT_MS,
  TaskSelectionFixture,
} from "../fixtures"

async function closesAfterStart(): Promise<void> {
  const fixture = new TaskSelectionFixture()
  try {
    await fixture.start()
    await fixture.step()
    await fixture.close()
    await observeSelectionCleanup(fixture.directory)
  } finally {
    await fixture.close()
  }
}

async function closesAfterRefusals(): Promise<void> {
  const fixture = new TaskSelectionFixture()
  try {
    const session = await fixture.start()
    await fixture.step()
    await fixture.step()
    await fixture.step()
    await fixture.step()
    expect(session.messages.filter(isSelectionToolError)).toHaveLength(4)
    await fixture.close()
    await observeSelectionCleanup(fixture.directory)
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(SELECTION_CLEANUP_START, closesAfterStart, SELECTION_TIMEOUT_MS)
  test(SELECTION_CLEANUP_REFUSAL, closesAfterRefusals, SELECTION_TIMEOUT_MS)
}

describe(SELECTION_SUITE, register)
