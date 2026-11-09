import { expect, test } from "vitest"
import { buildLabels, labelOf } from "#synapse/report"
import { loadRuleGroups } from "#synapse/rules"

test("rejects an absent rule label", () => {
  expect(() => labelOf(buildLabels(loadRuleGroups()), "X99")).toThrow("X99")
})
