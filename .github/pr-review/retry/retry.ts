import { type Operation, type RetryPolicy } from "./types"

export async function retry<Result>(operation: Operation<Result>, policy: RetryPolicy): Promise<Result> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      if (!(error instanceof Error) || attempt >= policy.attempts || !policy.isRetryable(error)) {
        throw error
      }
      await sleep(policy.backoffMs * attempt)
    }
  }
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}
