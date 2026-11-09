import { describe, expect, test } from "vitest"
import { type ChatMessage } from "#synapse/client"
import { ModelError } from "#synapse/errors"
import { reviewChunk } from "#synapse/review"
import {
  FINDING_GENERAL,
  FINDING_OFF_DIFF,
  FINDING_ON_ADDED,
  RULE_IDS,
  replyJson,
} from "#synapse/tests/fixtures/review"
import { ScriptedCaller } from "#synapse/tests/review"

const COMPLETE = RULE_IDS

function run(caller: ScriptedCaller): ReturnType<typeof reviewChunk> {
  return reviewChunk((messages: ChatMessage[]) => caller.call(messages), "system", "user", RULE_IDS)
}

describe("reviewChunk", () => {
  test("keeps asking until a round brings nothing new", async () => {
    const caller = new ScriptedCaller([
      replyJson([FINDING_ON_ADDED], COMPLETE),
      replyJson([FINDING_OFF_DIFF], COMPLETE),
      replyJson([], COMPLETE),
    ])
    const outcome = await run(caller)
    expect(outcome).toEqual({ findings: [FINDING_ON_ADDED, FINDING_OFF_DIFF], complete: true })
    expect(caller.received.length).toBe(3)
  })

  test("stops when the model only repeats what it listed", async () => {
    const caller = new ScriptedCaller([
      replyJson([FINDING_ON_ADDED], COMPLETE),
      replyJson([FINDING_ON_ADDED], COMPLETE),
    ])
    expect((await run(caller)).findings).toEqual([FINDING_ON_ADDED])
  })

  test("sends the earlier answer back in the next round", async () => {
    const first = replyJson([FINDING_GENERAL], COMPLETE)
    const caller = new ScriptedCaller([first, replyJson([], COMPLETE)])
    await run(caller)
    expect(caller.received.at(1)?.at(2)?.content).toBe(first)
  })

  test("asks again when the coverage is incomplete", async () => {
    const caller = new ScriptedCaller([replyJson([], ["C01"]), replyJson([], COMPLETE)])
    expect((await run(caller)).complete).toBe(true)
    expect(caller.received.length).toBe(2)
  })

  test("fails when every answer is invalid", async () => {
    await expect(run(new ScriptedCaller(["sem json", "sem json"]))).rejects.toThrow(ModelError)
  })

  test("reports an incomplete outcome when the rounds run out", async () => {
    const endless = Array.from({ length: 8 }, (_, index) =>
      replyJson([{ ...FINDING_ON_ADDED, line: index + 1 }], COMPLETE),
    )
    const outcome = await run(new ScriptedCaller(endless))
    expect([outcome.complete, outcome.findings.length]).toEqual([false, 8])
  })
})
