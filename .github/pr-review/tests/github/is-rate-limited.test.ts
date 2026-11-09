import { describe, expect, test } from "vitest"
import { CommandError } from "#synapse/errors"
import { isOwnComment, isRateLimited } from "#synapse/github"

describe("isRateLimited", () => {
  test("recognises the secondary rate limit message", () => {
    expect(isRateLimited(new CommandError("You have exceeded a secondary rate limit"))).toBe(true)
  })

  test("does not retry any other command failure", () => {
    expect(isRateLimited(new CommandError("HTTP 403 forbidden"))).toBe(false)
  })
})

describe("isOwnComment", () => {
  test("accepts a bot comment that carries the marker", () => {
    expect(
      isOwnComment({ id: 1, body: "<!-- pr-review-bot:inline -->x", user: { login: "github-actions[bot]" } }),
    ).toBe(true)
  })

  test("rejects the same marker from another author", () => {
    expect(isOwnComment({ id: 1, body: "<!-- pr-review-bot:inline -->x", user: { login: "alguem" } })).toBe(false)
  })
})
