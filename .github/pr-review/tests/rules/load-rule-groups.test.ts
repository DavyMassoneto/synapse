import { describe, expect, test } from "vitest"
import { loadRuleGroups } from "#synapse/rules"
import { promptFile } from "#synapse/tests/fixtures"

describe("loadRuleGroups", () => {
  const groups = loadRuleGroups()
  const ids = groups.flatMap((group) => group.rules.map((rule) => rule.id))

  test("loads the three groups with a rule each", () => {
    expect(groups.map((group) => group.rules.length > 0)).toEqual([true, true, true])
  })

  test("gives every rule a unique id", () => {
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("parses every rule written in the files", () => {
    const written = groups.map((group) => group.text.match(/^- \*\*[A-Z]\d{2} /gm)?.length)
    expect(groups.map((group) => group.rules.length)).toEqual(written)
  })

  test("keeps the format file in sync with the response schema", () => {
    expect(promptFile("format")).toContain('"coverage"')
  })
})
