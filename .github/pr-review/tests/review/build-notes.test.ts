import { describe, expect, test } from "vitest"
import { buildNotes } from "#synapse/review"
import { type Source } from "#synapse/source"

const COMPLETE: Source = { path: "a.ts", text: "x", incomplete: false }
const TRUNCATED: Source = { path: "b.ts", text: "x", incomplete: true }

describe("buildNotes", () => {
  test("has no note for a complete review", () => {
    expect(buildNotes({ findings: [], complete: true }, [COMPLETE])).toEqual([])
  })

  test("notes when the review ran out of rounds", () => {
    expect(buildNotes({ findings: [], complete: false }, [COMPLETE])).toEqual([
      "Revisão incompleta: a PR ainda trazia achados novos depois de 8 rodadas.",
    ])
  })

  test("lists the incomplete files", () => {
    expect(buildNotes({ findings: [], complete: true }, [COMPLETE, TRUNCATED])[0]).toContain("b.ts")
  })
})
