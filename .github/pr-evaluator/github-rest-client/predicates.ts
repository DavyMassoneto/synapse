import {
  FORBIDDEN_STATUS,
  MAX_RETRY_SECONDS,
  NO_REMAINING,
  RATE_LIMIT_STATUS,
  REMAINING_HEADER,
  RETRY_AFTER_HEADER,
} from "./constants"

export function hasRateLimitSignal(response: Response): boolean {
  return response.headers.has(RETRY_AFTER_HEADER) || response.headers.get(REMAINING_HEADER) === NO_REMAINING
}

export function isRateLimited(response: Response): boolean {
  return response.status === RATE_LIMIT_STATUS || (response.status === FORBIDDEN_STATUS && hasRateLimitSignal(response))
}

export function isRetryAfterSeconds(seconds: number): boolean {
  return seconds > 0 && seconds <= MAX_RETRY_SECONDS
}
