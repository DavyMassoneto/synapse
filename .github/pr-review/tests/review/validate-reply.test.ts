import { describe, expect, test } from "vitest"
import { ModelError } from "#synapse/errors"
import { parseReply, validateReply } from "#synapse/review"
import { RULE_IDS } from "#synapse/tests/fixtures"

describe("parseReply", () => {
  test("reads the json between other text", () => {
    const reply = parseReply('antes {"coverage": ["C01"], "findings": []} depois')
    expect(reply.coverage).toEqual(["C01"])
  })

  test("rejects an answer without json", () => {
    expect(() => parseReply("nada")).toThrow(ModelError)
  })

  test("rejects a finding without a body", () => {
    const text = '{"coverage": [], "findings": [{"rule": "C01", "path": "a", "line": 1, "body": ""}]}'
    expect(() => parseReply(text)).toThrow(ModelError)
  })

  test("rejects a finding with a boolean line", () => {
    const text = '{"coverage": [], "findings": [{"rule": "C01", "path": "a", "line": true, "body": "x"}]}'
    expect(() => parseReply(text)).toThrow(ModelError)
  })

  test("rejects malformed json between the braces", () => {
    expect(() => parseReply("{x}")).toThrow(ModelError)
  })
})

describe("validateReply", () => {
  test("accepts a reply that covers every rule", () => {
    expect(() => validateReply({ coverage: RULE_IDS, findings: [] }, RULE_IDS)).not.toThrow()
  })

  test("rejects a reply that skips a rule", () => {
    expect(() => validateReply({ coverage: ["C01"], findings: [] }, RULE_IDS)).toThrow("C03, E01")
  })

  test("rejects a finding under an unknown rule", () => {
    const finding = { rule: "Z99", path: "a", line: 1, body: "x" }
    expect(() => validateReply({ coverage: RULE_IDS, findings: [finding] }, RULE_IDS)).toThrow("Z99")
  })
})
