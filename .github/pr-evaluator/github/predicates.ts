import { FORBIDDEN_STATUS, RATE_LIMIT_STATUS } from "./constants"

export function isRateLimited(status: number, retryAfter: string, remaining: string): boolean {
  return status === RATE_LIMIT_STATUS || (status === FORBIDDEN_STATUS && (retryAfter.length > 0 || remaining === "0"))
}
