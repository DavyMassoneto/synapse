import { describe, expect, test } from "vitest"
import { type ChatMessage } from "#synapse/client"
import { type ReviewRequest, reviewAll } from "#synapse/review"
import { CONTINUE_MESSAGE } from "#synapse/review/rounds"
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
  test("reviews all large sources in the same conversation through completion", async () => {
    const answer = replyJson([FINDING_GENERAL], RULE_IDS)
    const caller = new ScriptedCaller([answer, replyJson([], RULE_IDS)])
    const reviewRequest = request(caller, false)
    reviewRequest.sources = [
      { path: "first.ts", text: `=== first.ts\n${"a".repeat(300_000)}`, incomplete: false },
      { path: "second.ts", text: `=== second.ts\n${"b".repeat(300_000)}`, incomplete: false },
    ]
    const result = await reviewAll(reviewRequest)
    expect(result.findings).toEqual([FINDING_GENERAL])
    expect(caller.received).toHaveLength(2)
    const firstConversation = caller.received.at(0)
    expect(firstConversation?.at(1)?.content).toContain("=== first.ts")
    expect(firstConversation?.at(1)?.content).toContain("=== second.ts")
    expect(firstConversation).toHaveLength(2)
    expect(caller.received.at(1)?.slice(0, 2)).toEqual(firstConversation)
    expect(caller.received.at(1)?.slice(2)).toEqual([
      { role: "assistant", content: answer },
      { role: "user", content: CONTINUE_MESSAGE },
    ])
    for (const conversation of caller.received) {
      for (const message of conversation) {
        expect(message.content).not.toContain("parte")
      }
    }
  })

  test("reviews forty sources without skipping any or starting another conversation", async () => {
    const caller = new ScriptedCaller([replyJson([], RULE_IDS)])
    const reviewRequest = request(caller, false)
    reviewRequest.sources = Array.from({ length: 40 }, (_, index) => ({
      path: `file-${index}.ts`,
      text: `=== file-${index}.ts\n${"x".repeat(100_000)}`,
      incomplete: false,
    }))
    const result = await reviewAll(reviewRequest)
    expect(caller.received).toHaveLength(1)
    for (const source of reviewRequest.sources) {
      expect(caller.received.at(0)?.at(1)?.content).toContain(source.text)
    }
    expect(result).toEqual({ verdict: "OK", findings: [], notes: [] })
    expect(result.notes.join(" ")).not.toContain("parte")
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
