import { describe, expect, test } from "vitest"
import { buildNotes } from "#synapse/review"
import { type Source } from "#synapse/source"

const COMPLETE: Source = { path: "a.ts", text: "x", incomplete: false }
const TRUNCATED: Source = { path: "b.ts", text: "x", incomplete: true }

describe("buildNotes", () => {
  test("has no note for a complete review", () => {
    expect(buildNotes([{ findings: [], complete: true }], 0, [COMPLETE])).toEqual([])
  })

  test("notes the part that ran out of rounds", () => {
    expect(buildNotes([{ findings: [], complete: false }], 0, [COMPLETE])[0]).toContain("parte 1")
  })

  test("notes the skipped parts", () => {
    expect(buildNotes([], 2, [])[0]).toContain("2 parte(s)")
  })

  test("lists the incomplete files", () => {
    expect(buildNotes([], 0, [COMPLETE, TRUNCATED])[0]).toContain("b.ts")
  })
})
