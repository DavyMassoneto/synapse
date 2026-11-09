import { describe, expect, test } from "vitest"
import { decideVerdict } from "#synapse/review"
import { FINDING_ON_ADDED } from "#synapse/tests/fixtures/review"

describe("decideVerdict", () => {
  test("is ok only without findings and notes", () => {
    expect(decideVerdict([], [])).toBe("OK")
  })

  test("is attention when there is a finding", () => {
    expect(decideVerdict([FINDING_ON_ADDED], [])).toBe("ATENÇÃO")
  })

  test("is attention when the review is incomplete", () => {
    expect(decideVerdict([], ["nota"])).toBe("ATENÇÃO")
  })
})
