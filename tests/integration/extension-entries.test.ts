import { describe, expect, test } from "vitest"
import {
  ENTRIES_REAL_ABSENT,
  ENTRIES_REAL_PATHS,
  ENTRIES_REGISTRATIONS,
  ENTRIES_SDK_IMPORT_TIMEOUT_MS,
  ENTRIES_SUITE,
  ENTRIES_TOOL_COUNTS,
  ENTRIES_VIRTUAL_MODEL,
  entryPathsLoader,
} from "../fixtures"

async function loadsSevenRealPaths(): Promise<void> {
  const loader = await entryPathsLoader()
  const result = loader.getExtensions()
  expect(result.errors).toEqual([])
  expect(result.extensions).toHaveLength(7)
  for (const [position, extension] of result.extensions.entries()) {
    expect(extension.tools.size).toBe(ENTRIES_TOOL_COUNTS[position])
  }
  result.runtime.invalidate()
}

async function disabledEntriesAreAbsent(): Promise<void> {
  for (let disabled = 0; disabled < 7; disabled++) {
    const loader = await entryPathsLoader(disabled)
    const result = loader.getExtensions()
    expect(result.errors).toEqual([])
    expect(result.extensions).toHaveLength(6)
    const expected = ENTRIES_REGISTRATIONS.toSpliced(disabled, 1)
    for (const [position, extension] of result.extensions.entries()) {
      const eventCounts: number[] = []
      for (const handlers of extension.handlers.values()) {
        eventCounts.push(handlers.length)
      }
      expect({
        eventCounts,
        tools: Array.from(extension.tools.keys()),
        commands: Array.from(extension.commands.keys()),
        events: Array.from(extension.handlers.keys()),
      }).toEqual(expected[position])
    }
    if (disabled === 3) {
      expect(result.runtime.pendingVirtualModelRegistrations).toHaveLength(0)
    } else {
      expect(result.runtime.pendingVirtualModelRegistrations).toHaveLength(1)
      expect(result.runtime.pendingVirtualModelRegistrations[0]?.definition).toMatchObject(ENTRIES_VIRTUAL_MODEL)
    }
    result.runtime.invalidate()
  }
}

function suite(): void {
  test(ENTRIES_REAL_PATHS, loadsSevenRealPaths, ENTRIES_SDK_IMPORT_TIMEOUT_MS)
  test(ENTRIES_REAL_ABSENT, disabledEntriesAreAbsent, ENTRIES_SDK_IMPORT_TIMEOUT_MS)
}

describe(ENTRIES_SUITE, suite)
