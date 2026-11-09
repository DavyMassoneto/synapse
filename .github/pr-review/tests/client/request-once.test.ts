import { afterEach, describe, expect, test, vi } from "vitest"
import { requestOnce } from "#synapse/client"
import { MESSAGES } from "#synapse/tests/client"
import { SETTINGS } from "#synapse/tests/fixtures/settings"

vi.mock("#synapse/client/request/constants", async (importOriginal) => {
  const constants = await importOriginal<typeof import("#synapse/client/request/constants")>()
  return { ...constants, TIMEOUT_MS: 1 }
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("requestOnce", () => {
  test("aborts a request that never receives a response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>((_url, options) => {
        const signal = options?.signal
        if (signal === undefined || signal === null) {
          return Promise.reject(new Error("missing request timeout signal"))
        }
        return new Promise<Response>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new DOMException("timed out", "TimeoutError")), { once: true })
        })
      }),
    )
    await expect(requestOnce(SETTINGS, MESSAGES)).rejects.toHaveProperty("name", "TimeoutError")
  })
})
