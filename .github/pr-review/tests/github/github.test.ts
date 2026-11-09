import { describe, expect, test } from "vitest"
import { CommandError } from "#synapse/errors"
import { buildReviewPayload, publishSummary, replaceInlineComments } from "#synapse/github"
import { type CommandRequest } from "#synapse/shell"
import { RecordedRunner, SETTINGS } from "#synapse/tests/fixtures"

const OWN_BODY = "<!-- pr-review-bot:summary:0 -->\ncorpo"
const COMMENT_PAGES = JSON.stringify([
  [
    { id: 1, body: OWN_BODY, user: { login: "github-actions[bot]" } },
    { id: 2, body: OWN_BODY, user: { login: "github-actions[bot]" } },
    { id: 3, body: "outro", user: { login: "github-actions[bot]" } },
    { id: 4, body: OWN_BODY, user: { login: "alguem" } },
  ],
])

function runnerWithComments(): RecordedRunner {
  return new RecordedRunner((request) => {
    if (request.args.includes("--paginate")) {
      return COMMENT_PAGES
    }
    return ""
  })
}

function methodOf(call: CommandRequest): string {
  const flag = call.args.indexOf("-X")
  return call.args.slice(flag + 1, flag + 2).join("")
}

function methodsOf(recorded: RecordedRunner): string[] {
  return recorded.calls.filter((call) => call.args.includes("-X")).map((call) => methodOf(call))
}

describe("publishSummary", () => {
  test("updates the first own comment and deletes the surplus ones", async () => {
    const recorded = runnerWithComments()
    await publishSummary((request) => recorded.run(request), SETTINGS, ["pagina"])
    expect(methodsOf(recorded)).toEqual(["PATCH", "DELETE"])
  })

  test("creates the pages that have no comment yet", async () => {
    const recorded = runnerWithComments()
    await publishSummary((request) => recorded.run(request), SETTINGS, ["a", "b", "c"])
    expect(methodsOf(recorded)).toEqual(["PATCH", "PATCH", "POST"])
  })
})

describe("replaceInlineComments", () => {
  test("posts the new review before deleting the old comments", async () => {
    const recorded = runnerWithComments()
    await replaceInlineComments((request) => recorded.run(request), SETTINGS, [{ path: "a.ts", line: 1, body: "x" }])
    expect(methodsOf(recorded)).toEqual(["POST", "DELETE", "DELETE"])
  })

  test("keeps the old comments when posting fails", async () => {
    const recorded = new RecordedRunner((request) => {
      if (request.args.includes("--paginate")) {
        return COMMENT_PAGES
      }
      throw new CommandError("HTTP 422")
    })
    await expect(
      replaceInlineComments((request) => recorded.run(request), SETTINGS, [{ path: "a.ts", line: 1, body: "x" }]),
    ).rejects.toThrow("HTTP 422")
    expect(methodsOf(recorded)).toEqual(["POST"])
  })

  test("only deletes when there is nothing to post", async () => {
    const recorded = runnerWithComments()
    await replaceInlineComments((request) => recorded.run(request), SETTINGS, [])
    expect(methodsOf(recorded)).toEqual(["DELETE", "DELETE"])
  })
})

describe("buildReviewPayload", () => {
  test("pins the head commit and the side of every comment", () => {
    expect(buildReviewPayload(SETTINGS, [{ path: "a.ts", line: 3, body: "x" }])).toEqual({
      commit_id: "head",
      event: "COMMENT",
      comments: [{ path: "a.ts", line: 3, body: "x", side: "RIGHT" }],
    })
  })
})
