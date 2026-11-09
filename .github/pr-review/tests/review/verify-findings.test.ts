import { describe, expect, test } from "vitest"
import { type ChatMessage } from "#synapse/client"
import { ModelError } from "#synapse/errors"
import { buildVerifyQuestion, verifyFindings } from "#synapse/review"
import { FINDING_GENERAL, FINDING_OFF_DIFF, FINDING_ON_ADDED } from "#synapse/tests/fixtures"
import { ScriptedCaller } from "#synapse/tests/review"

const FINDINGS = [FINDING_ON_ADDED, FINDING_OFF_DIFF, FINDING_GENERAL]

function verify(caller: ScriptedCaller): ReturnType<typeof verifyFindings> {
  return verifyFindings((messages: ChatMessage[]) => caller.call(messages), "arquivos", FINDINGS)
}

describe("verifyFindings", () => {
  test("keeps every finding when none is refuted", async () => {
    expect(await verify(new ScriptedCaller(['{"refuted": []}']))).toEqual(FINDINGS)
  })

  test("removes the refuted findings by their number", async () => {
    expect(await verify(new ScriptedCaller(['{"refuted": [2]}']))).toEqual([FINDING_ON_ADDED, FINDING_GENERAL])
  })

  test("asks again when the answer is not valid", async () => {
    expect(await verify(new ScriptedCaller(["nada", '{"refuted": [1]}']))).toEqual([FINDING_OFF_DIFF, FINDING_GENERAL])
  })

  test("fails when the answer stays invalid", async () => {
    await expect(verify(new ScriptedCaller(["nada", "nada"]))).rejects.toThrow(ModelError)
  })

  test("does not call the model without findings", async () => {
    const caller = new ScriptedCaller([])
    await verifyFindings((messages: ChatMessage[]) => caller.call(messages), "arquivos", [])
    expect(caller.received.length).toBe(0)
  })
})

describe("buildVerifyQuestion", () => {
  test("numbers each finding with its rule and place", () => {
    expect(buildVerifyQuestion([FINDING_ON_ADDED])).toContain("1. [C01] src/a.ts:11 problema")
  })
})
