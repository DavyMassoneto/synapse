import { expect, test } from "vitest"
import { groupBySize } from "#synapse/chunks"

test("starts a new group when the next item exceeds the limit", () => {
  expect(groupBySize(["aa", "bb", "c"], 3, (text) => text.length)).toEqual([["aa"], ["bb", "c"]])
})

test("keeps one empty group for no items", () => {
  expect(groupBySize<string>([], 3, (text) => text.length)).toEqual([[]])
})
