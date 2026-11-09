import { describe, expect, test } from "vitest"
import { isRetryable } from "#synapse/client"
import { HttpStatusError, ModelError } from "#synapse/errors"

describe("isRetryable", () => {
  test("retries a service unavailable status", () => {
    expect(isRetryable(new HttpStatusError(503, "x"))).toBe(true)
  })

  test("does not retry an unauthorized status", () => {
    expect(isRetryable(new HttpStatusError(401, "x"))).toBe(false)
  })

  test("retries a network failure", () => {
    expect(isRetryable(new TypeError("fetch failed"))).toBe(true)
  })

  test.each(["TimeoutError", "AbortError"])("retries a %s", (name) => {
    expect(isRetryable(new DOMException("request interrupted", name))).toBe(true)
  })

  test("does not retry an invalid model answer", () => {
    expect(isRetryable(new ModelError("x"))).toBe(false)
  })
})
