import { describe, expect, test } from "vitest"
import { CommandError } from "#synapse/errors"
import { callApiWithoutBody, isRateLimited, rateLimitDelay } from "#synapse/github"
import { createTiming, RecordedRunner } from "#synapse/tests/fixtures"

function emptyRunner(): string {
  return ""
}

describe("GitHub rate limit waits", () => {
  test("keeps mutation pacing isolated between executions sharing a runner", async () => {
    const waits: number[] = []
    const timing = createTiming(async (ms) => {
      waits.push(ms)
    })
    const independent = { ...timing }
    await callApiWithoutBody(emptyRunner, "POST", "one", timing)
    await callApiWithoutBody(emptyRunner, "POST", "two", independent)
    expect(waits).toEqual([])
    await callApiWithoutBody(emptyRunner, "DELETE", "one", timing)
    expect(waits).toEqual([1000])
  })
  test("uses reset time for exhausted primary quota and exponential fallback", () => {
    const error = new CommandError(
      "rate limit",
      "HTTP/2.0 403 Forbidden\nx-ratelimit-remaining: 0\nx-ratelimit-reset: 200\n\n{}",
    )
    expect(rateLimitDelay(error, 1, 80000)).toBe(120000)
    expect([1, 2, 3].map((attempt) => rateLimitDelay(new CommandError("rate limit"), attempt, 0))).toEqual([
      60000, 120000, 240000,
    ])
    expect(isRateLimited(new CommandError("forbidden", "HTTP/2.0 403 Forbidden\n\n{}"))).toBe(false)
  })

  test("waits before every serial mutation", async () => {
    const waits: number[] = []
    const runner = emptyRunner
    const timing = createTiming(async (ms) => {
      waits.push(ms)
    })
    await callApiWithoutBody(runner, "POST", "route", timing)
    await callApiWithoutBody(runner, "DELETE", "route/1", timing)
    await callApiWithoutBody(runner, "DELETE", "route/2", timing)
    expect(waits).toEqual([1000, 1000])
  })

  test("waits after the exhausted retry before a subsequent summary mutation", async () => {
    const waits: number[] = []
    const recorded = new RecordedRunner(() => {
      if (recorded.calls.length <= 5) {
        throw new CommandError("secondary rate limit")
      }
      return ""
    })
    const runner = recorded.run.bind(recorded)
    const timing = createTiming(async (ms) => {
      waits.push(ms)
    })
    await expect(callApiWithoutBody(runner, "POST", "review", timing)).rejects.toThrow("rate limit")
    await callApiWithoutBody(runner, "PATCH", "summary", timing)
    expect(waits).toEqual([60000, 120000, 240000, 480000, 960000])
    expect(recorded.calls).toHaveLength(6)
  })
  test("captures included response headers and respects Retry-After", async () => {
    const waits: number[] = []
    const recorded = new RecordedRunner(() => {
      if (recorded.calls.length === 1) {
        throw new CommandError("secondary rate limit", "HTTP/2.0 403 Forbidden\r\nRetry-After: 120\r\n\r\n{}")
      }
      return "HTTP/2.0 204 No Content\r\n\r\n"
    })
    const runner = recorded.run.bind(recorded)
    const timing = createTiming(async (ms) => {
      waits.push(ms)
    })
    await callApiWithoutBody(runner, "DELETE", "route", timing)
    expect(recorded.calls.every((call) => call.args.includes("-i"))).toBe(true)
    expect(waits).toEqual([120000])
  })
})
