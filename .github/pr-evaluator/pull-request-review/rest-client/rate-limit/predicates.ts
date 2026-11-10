import { FORBIDDEN_STATUS, NO_REMAINING, RATE_LIMIT_STATUS } from "./constants"

export function hasRateLimitSignal(response: Response): boolean {
  return response.headers.has("retry-after") || response.headers.get("x-ratelimit-remaining") === NO_REMAINING
}

export function isRateLimited(response: Response): boolean {
  return response.status === RATE_LIMIT_STATUS || (response.status === FORBIDDEN_STATUS && hasRateLimitSignal(response))
}
