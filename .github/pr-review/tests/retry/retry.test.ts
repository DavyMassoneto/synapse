import { describe, expect, test } from "vitest"
import { retry } from "#synapse/retry"
import { failingTimes, TRANSIENT } from "#synapse/tests/retry"

describe("retry", () => {
  test("returns the first successful answer after retryable failures", async () => {
    const policy = { attempts: 3, backoffMs: 0, isRetryable: () => true }
    expect(await retry(failingTimes(2), policy)).toBe("ok")
  })

  test("gives up after the last attempt", async () => {
    const policy = { attempts: 2, backoffMs: 0, isRetryable: () => true }
    await expect(retry(failingTimes(5), policy)).rejects.toBe(TRANSIENT)
  })

  test("raises a non retryable error at once", async () => {
    const policy = { attempts: 3, backoffMs: 0, isRetryable: () => false }
    await expect(retry(failingTimes(1), policy)).rejects.toBe(TRANSIENT)
  })
})
