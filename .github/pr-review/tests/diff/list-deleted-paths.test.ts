import { describe, expect, test } from "vitest"
import { listDeletedPaths } from "#synapse/diff"
import {
  DELETED_SECTION,
  joinSections,
  QUOTED_DELETED_SECTION,
  SECTION_WITH_CONTEXT,
} from "#synapse/tests/fixtures/diff"

describe("listDeletedPaths", () => {
  test("lists only the deleted files", () => {
    expect(listDeletedPaths(joinSections(SECTION_WITH_CONTEXT, DELETED_SECTION))).toEqual(["old.ts"])
  })

  test("reads a quoted deleted path", () => {
    expect(listDeletedPaths(joinSections(QUOTED_DELETED_SECTION))).toEqual(["x y.ts"])
  })
})
