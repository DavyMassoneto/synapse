import { REQUEST_ATTEMPTS } from "./constants"
import { headerOf, isRateLimited } from "./rate-limit"

export function isRetryableResponse(response: Response, attempt: number): boolean {
  const retryAfter = headerOf(response, "retry-after")
  const remaining = headerOf(response, "x-ratelimit-remaining")
  return isRateLimited(response.status, retryAfter, remaining) && attempt < REQUEST_ATTEMPTS
}
