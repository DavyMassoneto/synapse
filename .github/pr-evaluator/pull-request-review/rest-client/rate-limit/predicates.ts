import { FORBIDDEN_STATUS, NO_REMAINING, RATE_LIMIT_STATUS } from "./constants"

export function isTooManyRequests(status: number): boolean {
  return status === RATE_LIMIT_STATUS
}

export function hasRateLimitSignal(retryAfter: string, remaining: string): boolean {
  return retryAfter.length > 0 || remaining === NO_REMAINING
}

export function isRateLimited(status: number, retryAfter: string, remaining: string): boolean {
  return isTooManyRequests(status) || (status === FORBIDDEN_STATUS && hasRateLimitSignal(retryAfter, remaining))
}
