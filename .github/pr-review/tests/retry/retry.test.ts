import { describe, expect, test } from "vitest"
import { retry } from "#synapse/retry"
import { FailingOperation, TRANSIENT } from "#synapse/tests/retry"

describe("retry", () => {
  test("returns the first successful answer after retryable failures", async () => {
    const policy = { attempts: 3, backoffMs: 0, isRetryable: () => true }
    const operation = new FailingOperation(2)
    expect(await retry(() => operation.run(), policy)).toBe("ok")
    expect(operation.calls).toBe(3)
  })

  test("gives up after the last attempt", async () => {
    const policy = { attempts: 2, backoffMs: 0, isRetryable: () => true }
    const operation = new FailingOperation(5)
    await expect(retry(() => operation.run(), policy)).rejects.toBe(TRANSIENT)
    expect(operation.calls).toBe(2)
  })

  test("raises a non retryable error at once", async () => {
    const policy = { attempts: 3, backoffMs: 0, isRetryable: () => false }
    const operation = new FailingOperation(1)
    await expect(retry(() => operation.run(), policy)).rejects.toBe(TRANSIENT)
    expect(operation.calls).toBe(1)
  })
})
