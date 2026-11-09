import { describe, expect, test } from "vitest"
import { splitChunks } from "#synapse/chunks"
import { type Source } from "#synapse/source"

const BIG_SOURCE: Source = { path: "a.ts", text: "x".repeat(100_000), incomplete: false }

describe("splitChunks", () => {
  test("reports the chunks beyond the chunk limit", () => {
    const split = splitChunks(Array.from({ length: 40 }, () => BIG_SOURCE))
    expect([split.chunks.length, split.skipped]).toEqual([10, 4])
  })

  test("keeps one empty chunk when the pr has no reviewable file", () => {
    expect(splitChunks([])).toEqual({ chunks: [[]], skipped: 0 })
  })
})
