import { describe, expect, test } from "vitest"
import { type ChatMessage } from "#synapse/client"
import { CommandError } from "#synapse/errors"
import { type Execution, executeReview } from "#synapse/pipeline"
import { loadRuleGroups } from "#synapse/rules"
import { type CommandRequest } from "#synapse/shell"
import { joinSections, PACKAGE_SECTION, RecordedRunner, replyJson, SETTINGS } from "#synapse/tests/fixtures"
import { ScriptedCaller } from "#synapse/tests/review"

const RULE_IDS = loadRuleGroups().flatMap((group) => group.rules.map((rule) => rule.id))
const FINDING = { rule: "C01", path: "package.json", line: 1, body: "problema" }

function answerFor(request: CommandRequest, failing: boolean): string {
  if (failing && request.args.includes("diff")) {
    throw new CommandError("gh quebrou")
  }
  if (request.args.includes("diff")) {
    return joinSections(PACKAGE_SECTION)
  }
  if (request.args.includes("--paginate")) {
    return "[[]]"
  }
  return "package.json"
}

function execution(recorded: RecordedRunner, caller: ScriptedCaller): Execution {
  return {
    settings: SETTINGS,
    ports: {
      runner: (request: CommandRequest) => recorded.run(request),
      caller: (messages: ChatMessage[]) => caller.call(messages),
    },
  }
}

function postedBodies(recorded: RecordedRunner): string[] {
  return recorded.calls.filter((call) => call.args.includes("POST")).map((call) => call.input)
}

describe("executeReview", () => {
  test("publishes the inline comment and the summary and exits with failure when it finds a defect", async () => {
    const recorded = new RecordedRunner((request) => answerFor(request, false))
    const caller = new ScriptedCaller([replyJson([FINDING], RULE_IDS), replyJson([], RULE_IDS), '{"refuted": []}'])
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

  test("publishes the failure when the model never covers every rule", async () => {
    const recorded = new RecordedRunner((request) => answerFor(request, false))
    const caller = new ScriptedCaller([replyJson([], ["C01"]), replyJson([], ["C01"])])
    expect(await executeReview(execution(recorded, caller))).toBe(1)
    expect(postedBodies(recorded).join("")).toContain("**Veredito: FALHA**")
  })
})
