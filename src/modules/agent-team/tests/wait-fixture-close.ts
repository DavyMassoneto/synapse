import { setTimeout } from "node:timers/promises"
import { SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_FIXTURE_CLOSE_TIMEOUT_ERROR } from "./native-scenario-constants"

export async function waitFixtureClose(terminal: Promise<number>): Promise<void> {
  const timer = new AbortController()
  try {
    const settled = Promise.allSettled([terminal])
    const expired = setTimeout(SHELL_NATIVE_TEST_MS, undefined, { signal: timer.signal })
    const result = await Promise.race([settled, expired])
    if (!result) {
      throw new Error(SHELL_FIXTURE_CLOSE_TIMEOUT_ERROR)
    }
  } finally {
    timer.abort()
  }
}
