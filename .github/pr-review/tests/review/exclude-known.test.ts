import { describe, expect, test } from "vitest"
import { excludeKnown } from "#synapse/review"
import { FINDING_GENERAL, FINDING_OFF_DIFF, FINDING_ON_ADDED } from "#synapse/tests/fixtures/review"

describe("excludeKnown", () => {
  test("drops the findings that were already listed", () => {
    expect(excludeKnown([FINDING_ON_ADDED, FINDING_OFF_DIFF], [FINDING_ON_ADDED])).toEqual([FINDING_OFF_DIFF])
  })

  test("drops a repeated candidate", () => {
    expect(excludeKnown([FINDING_GENERAL, FINDING_GENERAL], [])).toEqual([FINDING_GENERAL])
  })

  test("keeps the same line under another rule", () => {
    const other = { ...FINDING_ON_ADDED, rule: "C03" }
    expect(excludeKnown([other], [FINDING_ON_ADDED])).toEqual([other])
  })
})
