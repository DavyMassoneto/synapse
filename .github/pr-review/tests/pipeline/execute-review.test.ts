import { fileURLToPath } from "node:url"
import { describe, expect, test } from "vitest"
import { type ChatMessage, callModel } from "#synapse/client"
import { CommandError } from "#synapse/errors"
import { type Execution, executeReview } from "#synapse/pipeline"
import { loadRuleGroups } from "#synapse/rules"
import { type CommandRequest } from "#synapse/shell"
import { StubServer, sseWithFinish } from "#synapse/tests/client"
import { joinSections, PACKAGE_SECTION } from "#synapse/tests/fixtures/diff"
import { replyJson } from "#synapse/tests/fixtures/review"
import { SETTINGS } from "#synapse/tests/fixtures/settings"
import { RecordedRunner } from "#synapse/tests/fixtures/shell"
import { ScriptedCaller } from "#synapse/tests/review"

const RULE_IDS = loadRuleGroups().flatMap((group) => group.rules.map((rule) => rule.id))
const PACKAGE_PATH = fileURLToPath(new URL("../../../../package.json", import.meta.url))
const FINDING = { rule: "C01", path: PACKAGE_PATH, line: 1, body: "problema" }

function answerFor(request: CommandRequest, failing: boolean): string {
  if (failing && request.args.includes("diff")) {
    throw new CommandError("gh quebrou")
  }
  if (request.args.includes("diff")) {
    return joinSections(PACKAGE_SECTION.replaceAll("package.json", PACKAGE_PATH))
  }
  if (request.args.includes("--paginate")) {
    return "[[]]"
  }
  return PACKAGE_PATH
}

function execution(recorded: RecordedRunner, caller: ScriptedCaller): Execution {
  const runner = recorded.run.bind(recorded)
  return {
    settings: SETTINGS,
    ports: {
      timing: { now: () => 0, wait: async () => {}, hasMutation: false },
      runner,
      caller: (messages: ChatMessage[]) => caller.call(messages),
    },
  }
}

function postedBodies(recorded: RecordedRunner): string[] {
  return recorded.calls.filter((call) => call.args.includes("POST")).map((call) => call.input)
}

describe("executeReview", () => {
  test("respects rate limit cooldown before publishing the failure summary", async () => {
    const events: string[] = []
    const recorded = new RecordedRunner((request) => {
      if (request.args.includes("diff")) {
        events.push("403")
        throw new CommandError("secondary rate limit", "HTTP/2.0 403 Forbidden\nRetry-After: 120\n\n{}")
      }
      if (request.args.includes("--paginate")) {
        return "[[]]"
      }
      if (request.args.includes("POST")) {
        events.push("summary")
      }
      return ""
    })
    const run = execution(recorded, new ScriptedCaller([]))
    run.ports.timing = {
      hasMutation: false,
      now: () => 0,
      wait: async (ms) => {
        events.push(`wait:${ms}`)
      },
    }
    expect(await executeReview(run)).toBe(1)
    expect(events).toEqual([
      "403",
      "wait:120000",
      "403",
      "wait:120000",
      "403",
      "wait:120000",
      "403",
      "wait:120000",
      "403",
      "wait:120000",
      "summary",
    ])
  })
  test("preserves the original failure when failure publication also fails", async () => {
    const recorded = new RecordedRunner((request) => {
      throw new CommandError(request.args.includes("diff") ? "original-A" : "publication-B")
    })
    await expect(executeReview(execution(recorded, new ScriptedCaller([])))).rejects.toThrow("original-A")
  })

  test("rethrows unrelated errors without publishing a summary", async () => {
    const recorded = new RecordedRunner(() => {
      throw new Error("unrelated")
    })
    await expect(executeReview(execution(recorded, new ScriptedCaller([])))).rejects.toThrow("unrelated")
    expect(postedBodies(recorded)).toEqual([])
  })
  test("publishes the inline comment and the summary and exits with failure when it finds a defect", async () => {
    const recorded = new RecordedRunner((request) => answerFor(request, false))
    const caller = new ScriptedCaller([replyJson([FINDING], RULE_IDS), replyJson([], RULE_IDS)])
    expect(await executeReview(execution(recorded, caller))).toBe(1)
    const bodies = postedBodies(recorded).join("")
    expect(bodies).toContain("pr-review-bot:inline")
    expect(bodies).toContain("**Veredito: ATENÇÃO**")
  })

  test("exits with success and publishes an ok summary when no round finds a defect", async () => {
    const recorded = new RecordedRunner((request) => answerFor(request, false))
    const caller = new ScriptedCaller([replyJson([], RULE_IDS)])
    expect(await executeReview(execution(recorded, caller))).toBe(0)
    expect(postedBodies(recorded).join("")).toContain("**Veredito: OK**")
  })

  test("publishes the failure and exits with failure when a command fails", async () => {
    const recorded = new RecordedRunner((request) => answerFor(request, true))
    expect(await executeReview(execution(recorded, new ScriptedCaller([])))).toBe(1)
    expect(recorded.calls.at(-1)?.input).toContain("FALHA")
  })

  test("publishes a failure when the provider rejects input with HTTP 400", async () => {
    const stub = new StubServer([
      { status: 400, body: "context too long" },
      { status: 400, body: "context too long" },
    ])
    const settings = { ...SETTINGS, baseUrl: await stub.start() }
    try {
      const recorded = new RecordedRunner((request) => answerFor(request, false))
      const run = execution(recorded, new ScriptedCaller([]))
      run.ports.caller = (messages) => callModel(settings, messages)
      expect(await executeReview(run)).toBe(1)
      const bodies = postedBodies(recorded).join("")
      expect(bodies).toContain("**Veredito: FALHA**")
      expect(bodies).toContain("HTTP 400")
      expect(bodies).not.toContain("**Veredito: OK**")
      expect(stub.requests).toHaveLength(2)
    } finally {
      await stub.stop()
    }
  })

  test("retries length errors and publishes only a failure after the final attempt", async () => {
    const body = sseWithFinish("length", replyJson([], RULE_IDS))
    const stub = new StubServer([
      { status: 200, body },
      { status: 200, body },
    ])
    const settings = { ...SETTINGS, baseUrl: await stub.start() }
    try {
      const recorded = new RecordedRunner((request) => answerFor(request, false))
      const run = execution(recorded, new ScriptedCaller([]))
      run.ports.caller = (messages) => callModel(settings, messages)
      expect(await executeReview(run)).toBe(1)
      const bodies = postedBodies(recorded).join("")
      expect(bodies).toContain("**Veredito: FALHA**")
      expect(bodies).toContain("finish_reason=length")
      expect(bodies).not.toContain("**Veredito: OK**")
      expect(bodies).not.toContain("**Veredito: ATENÇÃO**")
      expect(stub.requests).toHaveLength(2)
    } finally {
      await stub.stop()
    }
  })

  test("publishes the failure when the model never covers every rule", async () => {
    const recorded = new RecordedRunner((request) => answerFor(request, false))
    const caller = new ScriptedCaller([replyJson([], ["C01"]), replyJson([], ["C01"])])
    expect(await executeReview(execution(recorded, caller))).toBe(1)
    expect(postedBodies(recorded).join("")).toContain("**Veredito: FALHA**")
  })
})
