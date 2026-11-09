import { type Operation } from "#synapse/retry"

export const TRANSIENT = new Error("transient")

export function failingTimes(failures: number): Operation<string> {
  let calls = 0
  return () => {
    calls += 1
    if (calls <= failures) {
      return Promise.reject(TRANSIENT)
    }
    return Promise.resolve("ok")
  }
}
