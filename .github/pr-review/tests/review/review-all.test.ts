import { describe, expect, test } from "vitest"
import { type ChatMessage } from "#synapse/client"
import { type ReviewRequest, reviewAll } from "#synapse/review"
import { FINDING_GENERAL, FINDING_ON_ADDED, RULE_IDS, replyJson, SETTINGS } from "#synapse/tests/fixtures"
import { ScriptedCaller } from "#synapse/tests/review"

const NONE_REFUTED = '{"refuted": []}'
const INPUT = { treeListing: "arvore", deletedPaths: [] }
const SOURCE = { path: "a.ts", text: "=== a.ts", incomplete: false }

function request(caller: ScriptedCaller, incomplete: boolean): ReviewRequest {
  return {
    caller: (messages: ChatMessage[]) => caller.call(messages),
    settings: SETTINGS,
    input: INPUT,
    systemPrompt: "system",
    ruleIds: RULE_IDS,
    sources: [{ ...SOURCE, incomplete }],
  }
}

describe("reviewAll", () => {
  test("is ok when no round finds a defect", async () => {
    const caller = new ScriptedCaller([replyJson([], RULE_IDS), replyJson([], RULE_IDS)])
    expect(await reviewAll(request(caller, false))).toEqual({ verdict: "OK", findings: [], notes: [] })
  })

  test("joins every finding in a single result", async () => {
    const caller = new ScriptedCaller([
      replyJson([FINDING_ON_ADDED, FINDING_GENERAL], RULE_IDS),
      replyJson([], RULE_IDS),
      NONE_REFUTED,
    ])
    const result = await reviewAll(request(caller, false))
    expect([result.verdict, result.findings.length]).toEqual(["ATENÇÃO", 2])
  })

  test("drops the findings the second pass refutes and keeps the others", async () => {
    const caller = new ScriptedCaller([
      replyJson([FINDING_ON_ADDED, FINDING_GENERAL], RULE_IDS),
      replyJson([], RULE_IDS),
      '{"refuted": [1]}',
    ])
    expect((await reviewAll(request(caller, false))).findings).toEqual([FINDING_GENERAL])
  })

  test("is ok when the second pass refutes every finding", async () => {
    const caller = new ScriptedCaller([
      replyJson([FINDING_ON_ADDED], RULE_IDS),
      replyJson([], RULE_IDS),
      '{"refuted": [1]}',
    ])
    expect((await reviewAll(request(caller, false))).verdict).toBe("OK")
  })

  test("is attention when a file was left incomplete", async () => {
    const caller = new ScriptedCaller([replyJson([], RULE_IDS), replyJson([], RULE_IDS)])
    const result = await reviewAll(request(caller, true))
    expect([result.verdict, result.findings.length]).toEqual(["ATENÇÃO", 0])
  })
})
