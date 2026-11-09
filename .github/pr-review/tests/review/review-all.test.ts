import { describe, expect, test } from "vitest"
import { CHUNK_CHARS } from "#synapse/chunks"
import { type ChatMessage } from "#synapse/client"
import { type ReviewRequest, reviewAll } from "#synapse/review"
import {
  FINDING_GENERAL,
  FINDING_ON_ADDED,
  REVIEW_INPUT,
  RULE_IDS,
  replyJson,
  SOURCE_A,
} from "#synapse/tests/fixtures/review"
import { SETTINGS } from "#synapse/tests/fixtures/settings"
import { ScriptedCaller } from "#synapse/tests/review"

function request(caller: ScriptedCaller, incomplete: boolean): ReviewRequest {
  return {
    caller: (messages: ChatMessage[]) => caller.call(messages),
    settings: SETTINGS,
    input: REVIEW_INPUT,
    systemPrompt: "system",
    ruleIds: RULE_IDS,
    sources: [{ ...SOURCE_A, incomplete }],
  }
}

describe("reviewAll", () => {
  test("keeps one copy of a finding repeated across two chunks", async () => {
    const caller = new ScriptedCaller([
      replyJson([FINDING_GENERAL], RULE_IDS),
      replyJson([FINDING_GENERAL], RULE_IDS),
      replyJson([], RULE_IDS),
      replyJson([], RULE_IDS),
    ])
    const reviewRequest = request(caller, false)
    reviewRequest.sources = [
      { path: "first.ts", text: "a".repeat(CHUNK_CHARS), incomplete: false },
      { path: "second.ts", text: "b".repeat(CHUNK_CHARS), incomplete: false },
    ]
    const result = await reviewAll(reviewRequest)
    expect(result.findings).toEqual([FINDING_GENERAL])
    expect(caller.received.length).toBe(4)
    expect(caller.received.at(0)?.at(1)?.content).toContain("parte 1 de 2")
    expect(caller.received.at(1)?.at(1)?.content).toContain("parte 2 de 2")
  })

  test("is ok when no round finds a defect", async () => {
    const caller = new ScriptedCaller([replyJson([], RULE_IDS), replyJson([], RULE_IDS)])
    expect(await reviewAll(request(caller, false))).toEqual({ verdict: "OK", findings: [], notes: [] })
  })

  test("joins every finding without a second verification pass", async () => {
    const caller = new ScriptedCaller([
      replyJson([FINDING_ON_ADDED, FINDING_GENERAL], RULE_IDS),
      replyJson([], RULE_IDS),
    ])
    const result = await reviewAll(request(caller, false))
    expect(result.findings).toEqual([FINDING_ON_ADDED, FINDING_GENERAL])
    expect(result.verdict).toBe("ATENÇÃO")
    expect(caller.received.length).toBe(2)
  })

  test("is attention when a file was left incomplete", async () => {
    const caller = new ScriptedCaller([replyJson([], RULE_IDS), replyJson([], RULE_IDS)])
    const result = await reviewAll(request(caller, true))
    expect([result.verdict, result.findings.length]).toEqual(["ATENÇÃO", 0])
  })
})
