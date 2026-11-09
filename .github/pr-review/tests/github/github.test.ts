import { describe, expect, test } from "vitest"
import { CommandError } from "#synapse/errors"
import { buildReviewPayload, listPaginated, publishSummary, replaceInlineComments } from "#synapse/github"
import { type CommandRequest, type CommandRunner } from "#synapse/shell"
import { createTiming, noWait, RecordedRunner, SETTINGS } from "#synapse/tests/fixtures"

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

function recordedRunner(recorded: RecordedRunner): CommandRunner {
  const runner = recorded.run.bind(recorded)
  return runner
}

function methodOf(call: CommandRequest): string {
  const flag = call.args.indexOf("-X")
  return call.args.slice(flag + 1, flag + 2).join("")
}

function methodsOf(recorded: RecordedRunner): string[] {
  return recorded.calls.filter((call) => call.args.includes("-X")).map((call) => methodOf(call))
}

describe("listPaginated", () => {
  test("reads all pages", async () => {
    const comment = { id: 1, body: OWN_BODY, user: { login: "github-actions[bot]" } }
    expect(
      await listPaginated(() => JSON.stringify([[comment], [{ ...comment, id: 2 }]]), "route", createTiming(noWait)),
    ).toHaveLength(2)
  })

  test("rejects malformed comment pages", async () => {
    await expect(listPaginated(() => '[{"x":1}]', "route", createTiming(noWait))).rejects.toThrow()
  })
})

describe("publishSummary", () => {
  test("updates the first own comment and deletes the surplus ones", async () => {
    const recorded = runnerWithComments()
    await publishSummary(recordedRunner(recorded), SETTINGS, ["pagina"], createTiming(noWait))
    expect(methodsOf(recorded)).toEqual(["PATCH", "DELETE"])
  })

  test("creates the pages that have no comment yet", async () => {
    const recorded = runnerWithComments()
    await publishSummary(recordedRunner(recorded), SETTINGS, ["a", "b", "c"], createTiming(noWait))
    expect(methodsOf(recorded)).toEqual(["PATCH", "PATCH", "POST"])
  })
})

describe("replaceInlineComments", () => {
  test("converges after a partial deletion failure on reexecution", async () => {
    let ids = [1, 2]
    let nextId = 3
    let failDelete = true
    let posts = 0
    const recorded = new RecordedRunner((request) => {
      if (request.args.includes("--paginate")) {
        return JSON.stringify([ids.map((id) => ({ id, body: OWN_BODY, user: { login: "github-actions[bot]" } }))])
      }
      if (request.args.includes("POST")) {
        posts += 1
        ids.push(nextId)
        nextId += 1
      }
      if (request.args.includes("DELETE")) {
        const route = request.args.at(-1)
        if (failDelete && route?.endsWith("/2")) {
          failDelete = false
          throw new CommandError("HTTP 500")
        }
        ids = ids.filter((id) => !route?.endsWith(`/${id}`))
      }
      return ""
    })
    const runner = recorded.run.bind(recorded)
    const inline = [{ path: "a.ts", line: 1, body: "x" }]
    await expect(replaceInlineComments(runner, SETTINGS, inline, createTiming(noWait))).rejects.toThrow("500")
    expect(ids).toEqual([2, 3])
    await replaceInlineComments(runner, SETTINGS, inline, createTiming(noWait))
    expect(ids).toEqual([4])
    expect(posts).toBe(2)
  })
  test("retries a rejected review without duplicate successful posts or early deletes", async () => {
    let attempts = 0
    let successfulPosts = 0
    const recorded = new RecordedRunner((request) => {
      if (request.args.includes("--paginate")) {
        return COMMENT_PAGES
      }
      if (request.args.includes("POST")) {
        attempts += 1
        if (attempts === 1) {
          throw new CommandError("secondary rate limit", "HTTP/2.0 403 Forbidden\nRetry-After: 120\n\n{}")
        }
        successfulPosts += 1
      }
      if (request.args.includes("DELETE")) {
        expect(successfulPosts).toBe(1)
      }
      return ""
    })
    const waits: number[] = []
    const runner = recorded.run.bind(recorded)
    const clock = createTiming(async (ms) => {
      waits.push(ms)
    })
    await replaceInlineComments(runner, SETTINGS, [{ path: "a.ts", line: 1, body: "x" }], clock)
    expect(methodsOf(recorded)).toEqual(["POST", "POST", "DELETE", "DELETE"])
    expect(successfulPosts).toBe(1)
    expect(waits).toEqual([120000, 1000, 1000])
  })
  test("posts the new review before deleting the old comments", async () => {
    const recorded = runnerWithComments()
    await replaceInlineComments(
      recordedRunner(recorded),
      SETTINGS,
      [{ path: "a.ts", line: 1, body: "x" }],
      createTiming(noWait),
    )
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
      replaceInlineComments(
        recordedRunner(recorded),
        SETTINGS,
        [{ path: "a.ts", line: 1, body: "x" }],
        createTiming(noWait),
      ),
    ).rejects.toThrow("HTTP 422")
    expect(methodsOf(recorded)).toEqual(["POST"])
  })

  test("only deletes when there is nothing to post", async () => {
    const recorded = runnerWithComments()
    await replaceInlineComments(recordedRunner(recorded), SETTINGS, [], createTiming(noWait))
    expect(methodsOf(recorded)).toEqual(["DELETE", "DELETE"])
  })
})

describe("buildReviewPayload", () => {
  test("pins the head commit and the side of every comment", () => {
    expect(buildReviewPayload(SETTINGS, [{ path: "a.ts", line: 3, body: "x" }])).toEqual({
      commit_id: SETTINGS.headSha,
      event: "COMMENT",
      comments: [{ path: "a.ts", line: 3, body: "x", side: "RIGHT" }],
    })
  })
})
