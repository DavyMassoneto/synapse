import { describe, expect, test } from "vitest"
import { parseDiff } from "#synapse/diff"
import {
  DELETED_SECTION,
  joinSections,
  LOCK_SECTION,
  QUOTED_SECTION,
  RENAME_SECTION,
  SECTION_WITH_CONTEXT,
} from "#synapse/tests/fixtures"

const DIFF = joinSections(SECTION_WITH_CONTEXT, LOCK_SECTION, DELETED_SECTION)

describe("parseDiff", () => {
  test("numbers the added lines from each hunk start", () => {
    expect(parseDiff(DIFF).at(0)?.addedLines).toEqual(new Set([11, 12, 30]))
  })

  test("treats context lines as commentable and removed lines as not", () => {
    expect(parseDiff(DIFF).at(0)?.commentableLines).toEqual(new Set([10, 11, 12, 13, 30, 31]))
  })

  test("ignores lock files and deleted files", () => {
    expect(parseDiff(DIFF).map((file) => file.path)).toEqual(["src/a.ts"])
  })

  test("reads a quoted path without the timestamp", () => {
    expect(parseDiff(joinSections(QUOTED_SECTION)).at(0)?.path).toBe("x y.ts")
  })

  test("keeps a pure rename under its new path", () => {
    expect(parseDiff(joinSections(RENAME_SECTION)).at(0)?.path).toBe("new.ts")
  })
})
