import { type RetryPolicy } from "../retry"
import { BACKOFF_MS, MAX_ATTEMPTS } from "./constants"
import { isRetryable } from "./predicates"

export function buildRetryPolicy(): RetryPolicy {
  return { attempts: MAX_ATTEMPTS, backoffMs: BACKOFF_MS, isRetryable }
}
